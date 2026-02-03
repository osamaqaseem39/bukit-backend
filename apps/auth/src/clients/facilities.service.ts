import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { LocationsService } from './locations.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    private readonly locationsService: LocationsService,
  ) {}

  async createForLocation(
    locationId: string,
    createFacilityDto: CreateFacilityDto,
    user: { id: string; role: UserRole },
  ): Promise<Facility> {
    const location = await this.locationsService.findOne(locationId);

    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException(
        'You can only create facilities for your own locations',
      );
    }

    const facility = this.facilityRepository.create({
      ...createFacilityDto,
      location_id: locationId,
    });

    return await this.facilityRepository.save(facility);
  }

  async findAllForLocation(
    locationId: string,
    user: { id: string; role: UserRole },
  ): Promise<Facility[]> {
    const location = await this.locationsService.findOne(locationId);

    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException(
        'You can only view facilities for your own locations',
      );
    }

    return await this.facilityRepository.find({
      where: { location_id: locationId },
    });
  }

  async findOneForLocation(
    locationId: string,
    id: string,
    user: { id: string; role: UserRole },
  ): Promise<Facility> {
    const facility = await this.facilityRepository.findOne({
      where: { id, location_id: locationId },
    });

    if (!facility) {
      throw new NotFoundException(
        `Facility with ID ${id} not found for this location`,
      );
    }

    const location = await this.locationsService.findOne(locationId);

    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException(
        'You can only access facilities for your own locations',
      );
    }

    return facility;
  }

  async updateForLocation(
    locationId: string,
    id: string,
    updateFacilityDto: UpdateFacilityDto,
    user: { id: string; role: UserRole },
  ): Promise<Facility> {
    const facility = await this.findOneForLocation(locationId, id, user);
    Object.assign(facility, updateFacilityDto);
    return await this.facilityRepository.save(facility);
  }

  async removeForLocation(
    locationId: string,
    id: string,
    user: { id: string; role: UserRole },
  ): Promise<void> {
    const facility = await this.findOneForLocation(locationId, id, user);
    await this.facilityRepository.remove(facility);
  }
}

