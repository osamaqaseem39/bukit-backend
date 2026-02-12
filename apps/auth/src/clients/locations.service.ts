import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ClientsService } from './clients.service';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly clientsService: ClientsService,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    try {
      // Validate that the client_id exists in the clients table
      // (throws NotFoundException if it does not exist)
      await this.clientsService.findOne(createLocationDto.client_id);

      const location = this.locationRepository.create(createLocationDto);
      return await this.locationRepository.save(location);
    } catch (error) {
      this.logger.error('Error creating location', error);

      // Re-throw BadRequestException / NotFoundException if already thrown
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Handle PostgreSQL foreign key constraint violation
      if (error?.code === '23503') {
        throw new BadRequestException(
          `Invalid client_id: ${createLocationDto.client_id}. The client does not exist.`
        );
      }

      // Handle unique constraint violations
      if (error?.code === '23505') {
        throw new BadRequestException(
          'A location with these details already exists'
        );
      }

      // Handle not null constraint violations
      if (error?.code === '23502') {
        throw new BadRequestException(
          `Required field missing: ${error.column}`
        );
      }

      // Handle numeric field overflow (e.g., invalid latitude/longitude values)
      if (error?.code === '22003') {
        const detail = error?.detail || '';
        if (detail.includes('latitude') || detail.includes('longitude')) {
          throw new BadRequestException(
            'Invalid latitude or longitude value. Latitude must be between -90 and 90, and longitude must be between -180 and 180.'
          );
        }
        throw new BadRequestException(
          'Numeric value out of range. Please check your input values.'
        );
      }

      // Re-throw if it's already a known exception
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Generic database error
      throw new BadRequestException(
        error?.message || 'Failed to create location due to database error'
      );
    }
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
