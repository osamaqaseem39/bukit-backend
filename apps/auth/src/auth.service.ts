import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';
import { User, UserRole } from './users/user.entity';
import { ClientsService } from './clients/clients.service';
import { RegisterClientDto } from './clients/dto/register-client.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private clientsService: ClientsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registrationData: any) {
    const newUser = await this.usersService.create(registrationData);
    const { password_hash, ...result } = newUser;
    return result;
  }

  async registerClient(data: RegisterClientDto) {
    // 1. Force role to CLIENT
    data.user.role = UserRole.CLIENT;

    // 2. Create User
    const user = await this.usersService.create(data.user);

    // 3. Create Client Profile
    const clientData = {
      ...data.client,
      user_id: user.id,
    };

    const client = await this.clientsService.create(clientData);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      client,
    };
  }
}
