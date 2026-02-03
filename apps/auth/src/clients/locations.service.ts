import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(createLocationDto);
    return await this.locationRepository.save(location);
  }

  async findAll(clientId?: string): Promise<Location[]> {
    const query = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.client', 'client');

    if (clientId) {
      query.where('location.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async findByClientId(clientId: string): Promise<Location[]> {
    return await this.locationRepository.find({
      where: { client_id: clientId },
      relations: ['client'],
    });
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(id);
    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }

  async findOrCreateByAddress(
    clientId: string,
    addressData: {
      name: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<Location> {
    // Try to find existing location with same address
    const existingLocation = await this.locationRepository.findOne({
      where: {
        client_id: clientId,
        address: addressData.address,
        city: addressData.city,
        country: addressData.country,
      },
    });

    if (existingLocation) {
      return existingLocation;
    }

    // Create new location
    const location = this.locationRepository.create({
      client_id: clientId,
      ...addressData,
    });

    return await this.locationRepository.save(location);
  }
}
