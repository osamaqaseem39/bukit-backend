import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CricketGround } from './cricket.entity';
import { CreateCricketDto } from './dto/create-cricket.dto';
import { UpdateCricketDto } from './dto/update-cricket.dto';
import { UsersService } from '../../auth/src/users/users.service';
import { UserRole } from '../../auth/src/users/user.entity';
import { RegisterCricketDto } from './dto/register-cricket.dto';

@Injectable()
export class CricketService {
  constructor(
    @InjectRepository(CricketGround)
    private readonly cricketRepository: Repository<CricketGround>,
    private readonly usersService: UsersService,
  ) {}

  async register(registerCricketDto: RegisterCricketDto) {
    // Force role to CLIENT
    registerCricketDto.user.role = UserRole.CLIENT;

    // Force role to ADMIN
    registerCricketDto.admin.role = UserRole.ADMIN;

    // Create Client User
    const user = await this.usersService.create(registerCricketDto.user);

    // Create Admin User
    const admin = await this.usersService.create(registerCricketDto.admin);

    // Create Cricket Ground
    const cricketData = {
      ...registerCricketDto.cricket,
      client_id: user.id,
      admin_id: admin.id,
    };

    const cricketGround = this.cricketRepository.create(cricketData);
    const savedCricketGround = await this.cricketRepository.save(cricketGround);

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
      cricketGround: savedCricketGround,
    };
  }

  async create(createCricketDto: CreateCricketDto): Promise<CricketGround> {
    const cricketGround = this.cricketRepository.create(createCricketDto);
    return await this.cricketRepository.save(cricketGround);
  }

  async findAll(clientId?: string): Promise<CricketGround[]> {
    const query = this.cricketRepository
      .createQueryBuilder('cricket')
      .leftJoinAndSelect('cricket.client', 'client')
      .leftJoinAndSelect('cricket.admin', 'admin');

    if (clientId) {
      query.where('cricket.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<CricketGround> {
    const cricketGround = await this.cricketRepository.findOne({
      where: { id },
      relations: ['client', 'admin'],
    });

    if (!cricketGround) {
      throw new NotFoundException(`Cricket ground with ID ${id} not found`);
    }

    return cricketGround;
  }

  async findByClientId(clientId: string): Promise<CricketGround[]> {
    return await this.cricketRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'admin'],
    });
  }

  async update(
    id: string,
    updateCricketDto: UpdateCricketDto,
  ): Promise<CricketGround> {
    const cricketGround = await this.findOne(id);
    Object.assign(cricketGround, updateCricketDto);
    return await this.cricketRepository.save(cricketGround);
  }

  async remove(id: string): Promise<void> {
    const cricketGround = await this.findOne(id);
    await this.cricketRepository.remove(cricketGround);
  }
}
