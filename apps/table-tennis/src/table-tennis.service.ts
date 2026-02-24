import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableTennisTable } from './table-tennis.entity';
import { CreateTableTennisDto } from './dto/create-table-tennis.dto';
import { UpdateTableTennisDto } from './dto/update-table-tennis.dto';
import { UsersService } from '../../auth/src/users/users.service';
import { UserRole } from '../../auth/src/users/user.entity';
import { RegisterTableTennisDto } from './dto/register-table-tennis.dto';

@Injectable()
export class TableTennisService {
  constructor(
    @InjectRepository(TableTennisTable)
    private readonly tableTennisRepository: Repository<TableTennisTable>,
    private readonly usersService: UsersService,
  ) {}

  async register(registerTableTennisDto: RegisterTableTennisDto) {
    // Force role to CLIENT
    registerTableTennisDto.user.role = UserRole.CLIENT;

    // Force role to ADMIN
    registerTableTennisDto.admin.role = UserRole.ADMIN;

    // Create Client User
    const user = await this.usersService.create(registerTableTennisDto.user);

    // Create Admin User
    const admin = await this.usersService.create(registerTableTennisDto.admin);

    // Create Table Tennis Table
    const tableTennisData = {
      ...registerTableTennisDto.tableTennis,
      client_id: user.id,
      admin_id: admin.id,
    };

    const tableTennisTable = this.tableTennisRepository.create(tableTennisData);
    const savedTableTennisTable = await this.tableTennisRepository.save(tableTennisTable);

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
      tableTennisTable: savedTableTennisTable,
    };
  }

  async create(createTableTennisDto: CreateTableTennisDto): Promise<TableTennisTable> {
    const tableTennisTable = this.tableTennisRepository.create(createTableTennisDto);
    return await this.tableTennisRepository.save(tableTennisTable);
  }

  async findAll(clientId?: string): Promise<TableTennisTable[]> {
    const query = this.tableTennisRepository
      .createQueryBuilder('tableTennis')
      .leftJoinAndSelect('tableTennis.client', 'client')
      .leftJoinAndSelect('tableTennis.admin', 'admin');

    if (clientId) {
      query.where('tableTennis.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<TableTennisTable> {
    const tableTennisTable = await this.tableTennisRepository.findOne({
      where: { id },
      relations: ['client', 'admin'],
    });

    if (!tableTennisTable) {
      throw new NotFoundException(`Table tennis table with ID ${id} not found`);
    }

    return tableTennisTable;
  }

  async findByClientId(clientId: string): Promise<TableTennisTable[]> {
    return await this.tableTennisRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'admin'],
    });
  }

  async update(
    id: string,
    updateTableTennisDto: UpdateTableTennisDto,
  ): Promise<TableTennisTable> {
    const tableTennisTable = await this.findOne(id);
    Object.assign(tableTennisTable, updateTableTennisDto);
    return await this.tableTennisRepository.save(tableTennisTable);
  }

  async remove(id: string): Promise<void> {
    const tableTennisTable = await this.findOne(id);
    await this.tableTennisRepository.remove(tableTennisTable);
  }
}
