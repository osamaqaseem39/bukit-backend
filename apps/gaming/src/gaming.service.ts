import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamingCenter } from './gaming.entity';
import { CreateGamingDto } from './dto/create-gaming.dto';
import { UpdateGamingDto } from './dto/update-gaming.dto';
import { UsersService } from '../auth/src/users/users.service';
import { UserRole } from '../auth/src/users/user.entity';
import { RegisterGamingDto } from './dto/register-gaming.dto';
import { LocationsService } from '../auth/src/clients/locations.service';

@Injectable()
export class GamingService {
  constructor(
    @InjectRepository(GamingCenter)
    private readonly gamingRepository: Repository<GamingCenter>,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
  ) {}

  async register(registerGamingDto: RegisterGamingDto) {
    // Force role to CLIENT
    registerGamingDto.user.role = UserRole.CLIENT;

    // Force role to ADMIN
    registerGamingDto.admin.role = UserRole.ADMIN;

    // Create Client User
    const user = await this.usersService.create(registerGamingDto.user);

    // Create Admin User
    const admin = await this.usersService.create(registerGamingDto.admin);

    // Create or find Location from address data
    let location = null;
    if (
      registerGamingDto.gaming.address ||
      registerGamingDto.gaming.city ||
      registerGamingDto.gaming.country
    ) {
      location = await this.locationsService.findOrCreateByAddress(
        user.id,
        {
          name: registerGamingDto.gaming.name || 'Location',
          address: registerGamingDto.gaming.address,
          city: registerGamingDto.gaming.city,
          state: registerGamingDto.gaming.state,
          country: registerGamingDto.gaming.country,
          postal_code: registerGamingDto.gaming.postal_code,
          phone: registerGamingDto.gaming.phone,
        },
      );
    }

    // Create Gaming Center
    const gamingData = {
      ...registerGamingDto.gaming,
      client_id: user.id,
      admin_id: admin.id,
      location_id: location?.id || null,
    };

    // Remove address fields from gamingData since they're now in Location
    delete gamingData.address;
    delete gamingData.city;
    delete gamingData.state;
    delete gamingData.country;
    delete gamingData.postal_code;

    const gamingCenter = this.gamingRepository.create(gamingData);
    const savedGamingCenter = await this.gamingRepository.save(gamingCenter);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      location: location
        ? {
            id: location.id,
            name: location.name,
            address: location.address,
            city: location.city,
          }
        : null,
      gamingCenter: savedGamingCenter,
    };
  }

  async create(createGamingDto: CreateGamingDto): Promise<GamingCenter> {
    const gamingCenter = this.gamingRepository.create(createGamingDto);
    return await this.gamingRepository.save(gamingCenter);
  }

  async findAll(clientId?: string): Promise<GamingCenter[]> {
    const query = this.gamingRepository
      .createQueryBuilder('gaming')
      .leftJoinAndSelect('gaming.client', 'client')
      .leftJoinAndSelect('gaming.admin', 'admin')
      .leftJoinAndSelect('gaming.location', 'location');

    if (clientId) {
      query.where('gaming.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<GamingCenter> {
    const gamingCenter = await this.gamingRepository.findOne({
      where: { id },
      relations: ['client', 'admin', 'location'],
    });

    if (!gamingCenter) {
      throw new NotFoundException(`Gaming center with ID ${id} not found`);
    }

    return gamingCenter;
  }

  async findByClientId(clientId: string): Promise<GamingCenter[]> {
    return await this.gamingRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'admin', 'location'],
    });
  }

  async update(
    id: string,
    updateGamingDto: UpdateGamingDto,
  ): Promise<GamingCenter> {
    const gamingCenter = await this.findOne(id);
    Object.assign(gamingCenter, updateGamingDto);
    return await this.gamingRepository.save(gamingCenter);
  }

  async remove(id: string): Promise<void> {
    const gamingCenter = await this.findOne(id);
    await this.gamingRepository.remove(gamingCenter);
  }
}
