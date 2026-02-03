import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnookerTable } from './snooker.entity';
import { CreateSnookerDto } from './dto/create-snooker.dto';
import { UpdateSnookerDto } from './dto/update-snooker.dto';
import { UsersService } from '../auth/src/users/users.service';
import { UserRole } from '../auth/src/users/user.entity';
import { RegisterSnookerDto } from './dto/register-snooker.dto';

@Injectable()
export class SnookerService {
  constructor(
    @InjectRepository(SnookerTable)
    private readonly snookerRepository: Repository<SnookerTable>,
    private readonly usersService: UsersService,
  ) {}

  async register(registerSnookerDto: RegisterSnookerDto) {
    // Force role to CLIENT
    registerSnookerDto.user.role = UserRole.CLIENT;

    // Force role to ADMIN
    registerSnookerDto.admin.role = UserRole.ADMIN;

    // Create Client User
    const user = await this.usersService.create(registerSnookerDto.user);

    // Create Admin User
    const admin = await this.usersService.create(registerSnookerDto.admin);

    // Create Snooker Table
    const snookerData = {
      ...registerSnookerDto.snooker,
      client_id: user.id,
      admin_id: admin.id,
    };

    const snookerTable = this.snookerRepository.create(snookerData);
    const savedSnookerTable = await this.snookerRepository.save(snookerTable);

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
      snookerTable: savedSnookerTable,
    };
  }

  async create(createSnookerDto: CreateSnookerDto): Promise<SnookerTable> {
    const snookerTable = this.snookerRepository.create(createSnookerDto);
    return await this.snookerRepository.save(snookerTable);
  }

  async findAll(clientId?: string): Promise<SnookerTable[]> {
    const query = this.snookerRepository
      .createQueryBuilder('snooker')
      .leftJoinAndSelect('snooker.client', 'client')
      .leftJoinAndSelect('snooker.admin', 'admin');

    if (clientId) {
      query.where('snooker.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<SnookerTable> {
    const snookerTable = await this.snookerRepository.findOne({
      where: { id },
      relations: ['client', 'admin'],
    });

    if (!snookerTable) {
      throw new NotFoundException(`Snooker table with ID ${id} not found`);
    }

    return snookerTable;
  }

  async findByClientId(clientId: string): Promise<SnookerTable[]> {
    return await this.snookerRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'admin'],
    });
  }

  async update(id: string, updateSnookerDto: UpdateSnookerDto): Promise<SnookerTable> {
    const snookerTable = await this.findOne(id);
    Object.assign(snookerTable, updateSnookerDto);
    return await this.snookerRepository.save(snookerTable);
  }

  async remove(id: string): Promise<void> {
    const snookerTable = await this.findOne(id);
    await this.snookerRepository.remove(snookerTable);
  }
}
