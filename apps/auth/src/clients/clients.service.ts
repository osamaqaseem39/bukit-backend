import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, ClientStatus } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Check if user already has a client profile
    const existingClient = await this.clientRepository.findOne({
      where: { user_id: createClientDto.user_id },
    });

    if (existingClient) {
      throw new BadRequestException('User already has a client profile');
    }

    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(status?: ClientStatus): Promise<Client[]> {
    const query = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.user', 'user');

    if (status) {
      query.where('client.status = :status', { status });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async findByUserId(userId: string): Promise<Client | null> {
    return await this.clientRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    Object.assign(client, updateClientDto);

    return await this.clientRepository.save(client);
  }

  async approve(id: string, adminId: string): Promise<Client> {
    const client = await this.findOne(id);

    if (client.status !== ClientStatus.PENDING) {
      throw new BadRequestException('Only pending clients can be approved');
    }

    client.status = ClientStatus.APPROVED;
    client.approved_at = new Date();
    client.approved_by = adminId;

    return await this.clientRepository.save(client);
  }

  async reject(id: string, reason: string, adminId: string): Promise<Client> {
    const client = await this.findOne(id);

    if (client.status !== ClientStatus.PENDING) {
      throw new BadRequestException('Only pending clients can be rejected');
    }

    client.status = ClientStatus.REJECTED;
    client.rejection_reason = reason;
    client.approved_by = adminId;

    return await this.clientRepository.save(client);
  }

  async suspend(id: string, reason: string): Promise<Client> {
    const client = await this.findOne(id);

    client.status = ClientStatus.SUSPENDED;
    client.rejection_reason = reason;

    return await this.clientRepository.save(client);
  }

  async activate(id: string): Promise<Client> {
    const client = await this.findOne(id);

    if (
      client.status === ClientStatus.SUSPENDED ||
      client.status === ClientStatus.APPROVED
    ) {
      client.status = ClientStatus.ACTIVE;
      client.rejection_reason = null;
    } else {
      throw new BadRequestException(
        'Client cannot be activated from current status',
      );
    }

    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async updateCommissionRate(id: string, rate: number): Promise<Client> {
    const client = await this.findOne(id);

    if (rate < 0 || rate > 100) {
      throw new BadRequestException(
        'Commission rate must be between 0 and 100',
      );
    }

    client.commission_rate = rate;
    return await this.clientRepository.save(client);
  }

  async getStatistics() {
    const total = await this.clientRepository.count();
    const pending = await this.clientRepository.count({
      where: { status: ClientStatus.PENDING },
    });
    const approved = await this.clientRepository.count({
      where: { status: ClientStatus.APPROVED },
    });
    const active = await this.clientRepository.count({
      where: { status: ClientStatus.ACTIVE },
    });
    const rejected = await this.clientRepository.count({
      where: { status: ClientStatus.REJECTED },
    });
    const suspended = await this.clientRepository.count({
      where: { status: ClientStatus.SUSPENDED },
    });

    return {
      total,
      pending,
      approved,
      active,
      rejected,
      suspended,
    };
  }
}
