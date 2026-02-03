import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FutsalTurf } from './futsal-turf.entity';
import { CreateFutsalTurfDto } from './dto/create-futsal-turf.dto';
import { UpdateFutsalTurfDto } from './dto/update-futsal-turf.dto';
import { UsersService } from '../auth/src/users/users.service';
import { UserRole } from '../auth/src/users/user.entity';
import { RegisterFutsalTurfDto } from './dto/register-futsal-turf.dto';

@Injectable()
export class FutsalTurfService {
  constructor(
    @InjectRepository(FutsalTurf)
    private readonly futsalTurfRepository: Repository<FutsalTurf>,
    private readonly usersService: UsersService,
  ) {}

  async register(registerFutsalTurfDto: RegisterFutsalTurfDto) {
    // Force role to CLIENT
    registerFutsalTurfDto.user.role = UserRole.CLIENT;

    // Force role to ADMIN
    registerFutsalTurfDto.admin.role = UserRole.ADMIN;

    // Create Client User
    const user = await this.usersService.create(registerFutsalTurfDto.user);

    // Create Admin User
    const admin = await this.usersService.create(registerFutsalTurfDto.admin);

    // Create Futsal Turf
    const futsalTurfData = {
      ...registerFutsalTurfDto.futsalTurf,
      client_id: user.id,
      admin_id: admin.id,
    };

    const futsalTurf = this.futsalTurfRepository.create(futsalTurfData);
    const savedFutsalTurf = await this.futsalTurfRepository.save(futsalTurf);

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
      futsalTurf: savedFutsalTurf,
    };
  }

  async create(createFutsalTurfDto: CreateFutsalTurfDto): Promise<FutsalTurf> {
    const futsalTurf = this.futsalTurfRepository.create(createFutsalTurfDto);
    return await this.futsalTurfRepository.save(futsalTurf);
  }

  async findAll(clientId?: string): Promise<FutsalTurf[]> {
    const query = this.futsalTurfRepository
      .createQueryBuilder('futsal')
      .leftJoinAndSelect('futsal.client', 'client')
      .leftJoinAndSelect('futsal.admin', 'admin');

    if (clientId) {
      query.where('futsal.client_id = :clientId', { clientId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<FutsalTurf> {
    const futsalTurf = await this.futsalTurfRepository.findOne({
      where: { id },
      relations: ['client', 'admin'],
    });

    if (!futsalTurf) {
      throw new NotFoundException(`Futsal turf with ID ${id} not found`);
    }

    return futsalTurf;
  }

  async findByClientId(clientId: string): Promise<FutsalTurf[]> {
    return await this.futsalTurfRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'admin'],
    });
  }

  async update(
    id: string,
    updateFutsalTurfDto: UpdateFutsalTurfDto,
  ): Promise<FutsalTurf> {
    const futsalTurf = await this.findOne(id);
    Object.assign(futsalTurf, updateFutsalTurfDto);
    return await this.futsalTurfRepository.save(futsalTurf);
  }

  async remove(id: string): Promise<void> {
    const futsalTurf = await this.findOne(id);
    await this.futsalTurfRepository.remove(futsalTurf);
  }
}
