import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PadelCourt } from './padel.entity';
import { CreatePadelDto } from './dto/create-padel.dto';
import { UpdatePadelDto } from './dto/update-padel.dto';
import { UsersService } from '../../auth/src/users/users.service';
import { UserRole } from '../../auth/src/users/user.entity';
import { RegisterPadelDto } from './dto/register-padel.dto';

@Injectable()
export class PadelService {
  constructor(
    @InjectRepository(PadelCourt)
    private readonly padelRepository: Repository<PadelCourt>,
    private readonly usersService: UsersService,
  ) {}

  async register(registerPadelDto: RegisterPadelDto) {
    // Force role to CLIENT
    registerPadelDto.user.role = UserRole.CLIENT;

    // Force role to ADMIN
    registerPadelDto.admin.role = UserRole.ADMIN;

    // Create Client User
    const user = await this.usersService.create(registerPadelDto.user);

    // Create Admin User
    const admin = await this.usersService.create(registerPadelDto.admin);

    // Create Padel Court
    const padelData = {
      ...registerPadelDto.padel,
      client_id: user.id,
      admin_id: admin.id,
    };

    const padelCourt = this.padelRepository.create(padelData);
    const savedPadelCourt = await this.padelRepository.save(padelCourt);

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
      padelCourt: savedPadelCourt,
    };
  }

  async create(createPadelDto: CreatePadelDto): Promise<PadelCourt> {
    const padelCourt = this.padelRepository.create(createPadelDto);
    return await this.padelRepository.save(padelCourt);
  }

  async findAll(clientId?: string): Promise<PadelCourt[]> {
    const query = this.padelRepository
      .createQueryBuilder('padel')
      .leftJoinAndSelect('padel.client', 'client')
      .leftJoinAndSelect('padel.admin', 'admin');

    if (clientId) {
      query.where('padel.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<PadelCourt> {
    const padelCourt = await this.padelRepository.findOne({
      where: { id },
      relations: ['client', 'admin'],
    });

    if (!padelCourt) {
      throw new NotFoundException(`Padel court with ID ${id} not found`);
    }

    return padelCourt;
  }

  async findByClientId(clientId: string): Promise<PadelCourt[]> {
    return await this.padelRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'admin'],
    });
  }

  async update(id: string, updatePadelDto: UpdatePadelDto): Promise<PadelCourt> {
    const padelCourt = await this.findOne(id);
    Object.assign(padelCourt, updatePadelDto);
    return await this.padelRepository.save(padelCourt);
  }

  async remove(id: string): Promise<void> {
    const padelCourt = await this.findOne(id);
    await this.padelRepository.remove(padelCourt);
  }
}
