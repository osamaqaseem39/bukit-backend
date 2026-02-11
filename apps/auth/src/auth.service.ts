import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users/users.service';
import { User, UserRole } from './users/user.entity';
import { ClientsService } from './clients/clients.service';
import { RegisterClientDto } from './clients/dto/register-client.dto';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private clientsService: ClientsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  private getRefreshTokenExpiry(): Date {
    const days =
      this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private async createRefreshToken(user: User): Promise<RefreshToken> {
    const token = crypto.randomBytes(32).toString('hex');
    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      user_id: user.id,
      expires_at: this.getRefreshTokenExpiry(),
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
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

  async refreshTokens(refreshTokenToken: string) {
    if (!refreshTokenToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const existing = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenToken },
      relations: ['user'],
    });

    if (
      !existing ||
      existing.revoked_at ||
      !existing.user ||
      existing.expires_at.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate token
    existing.token = crypto.randomBytes(32).toString('hex');
    existing.expires_at = this.getRefreshTokenExpiry();
    existing.last_used_at = new Date();

    const saved = await this.refreshTokenRepository.save(existing);

    const payload = {
      email: existing.user.email,
      sub: existing.user.id,
      role: existing.user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      refresh_token: saved.token,
    };
  }

  async logout(refreshTokenToken?: string) {
    if (!refreshTokenToken) {
      return;
    }

    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenToken },
    });

    if (!token) {
      return;
    }

    token.revoked_at = new Date();
    await this.refreshTokenRepository.save(token);
  }
}
