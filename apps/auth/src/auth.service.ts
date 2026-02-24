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
import { CreateUserDto } from './users/dto/create-user.dto';

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
      requires_password_change: user.requires_password_change ?? false,
    };
  }

  async register(registrationData: any) {
    const newUser = await this.usersService.create(registrationData);
    const { password_hash, ...result } = newUser;
    return result;
  }

  async registerClient(data: RegisterClientDto) {
    // 1. Generate default password (ignore any password from request)
    const temporaryPassword = crypto
      .randomBytes(10)
      .toString('base64')
      .replace(/[/+=]/g, '')
      .slice(0, 12);

    // 2. Build a proper CreateUserDto with forced CLIENT role
    const userPayload: CreateUserDto = {
      name: data.user.name,
      email: data.user.email,
      password: temporaryPassword,
      role: UserRole.CLIENT,
    };

    // 3. Create User first (without client_id), require password change on first login
    const user = await this.usersService.create(userPayload, null, {
      requiresPasswordChange: true,
    });

    // 4. Update client_id to point to themselves (client admin owns their domain)
    const updatedUser = await this.usersService.updateUserClientId(user.id, user.id);

    // 5. Create Client Profile
    const clientData = {
      ...data.client,
      user_id: updatedUser.id,
    };

    const client = await this.clientsService.create(clientData);

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      client,
      temporary_password: temporaryPassword,
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.usersService.updatePassword(userId, newPassword, true);
    return { success: true };
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
