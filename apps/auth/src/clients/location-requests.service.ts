import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LocationRequest,
  LocationRequestStatus,
} from './location-request.entity';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationRequestsService {
  constructor(
    @InjectRepository(LocationRequest)
    private readonly locationRequestRepository: Repository<LocationRequest>,
    private readonly locationsService: LocationsService,
  ) {}

  async createForClient(
    clientId: string,
    createLocationDto: Omit<CreateLocationDto, 'client_id'>,
  ): Promise<LocationRequest> {
    const request = this.locationRequestRepository.create({
      ...createLocationDto,
      client_id: clientId,
      status: LocationRequestStatus.PENDING,
    });

    return this.locationRequestRepository.save(request);
  }

  async findAllPending(): Promise<LocationRequest[]> {
    return this.locationRequestRepository.find({
      where: { status: LocationRequestStatus.PENDING },
      relations: ['client'],
    });
  }

  async findOne(id: string): Promise<LocationRequest> {
    const request = await this.locationRequestRepository.findOne({
      where: { id },
      relations: ['client', 'approved_location'],
    });

    if (!request) {
      throw new NotFoundException(`Location request with ID ${id} not found`);
    }

    return request;
  }

  async approve(id: string): Promise<void> {
    const request = await this.findOne(id);

    if (request.status !== LocationRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const locationDto: CreateLocationDto = {
      client_id: request.client_id,
      name: request.name,
      description: request.description,
      phone: request.phone,
      address: request.address,
      city: request.city,
      state: request.state,
      country: request.country,
      postal_code: request.postal_code,
      latitude: request.latitude as number | undefined,
      longitude: request.longitude as number | undefined,
      facility_types: undefined,
    };

    const location = await this.locationsService.create(locationDto);

    request.status = LocationRequestStatus.APPROVED;
    request.approved_location_id = location.id;
    await this.locationRequestRepository.save(request);
  }

  async reject(id: string): Promise<void> {
    const request = await this.findOne(id);

    if (request.status !== LocationRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    request.status = LocationRequestStatus.REJECTED;
    await this.locationRequestRepository.save(request);
  }
}

