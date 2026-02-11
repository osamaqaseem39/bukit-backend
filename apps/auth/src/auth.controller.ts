import {
  Controller,
  Post,
  Request,
  UseGuards,
  Body,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { RegisterClientDto } from './clients/dto/register-client.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './users/user.entity';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const startTime = Date.now();
    console.log(`[AuthController] Registration request received for: ${createUserDto.email}`);
    
    try {
      const result = await this.authService.register(createUserDto);
      const duration = Date.now() - startTime;
      console.log(`[AuthController] Registration completed in ${duration}ms for: ${createUserDto.email}`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[AuthController] Registration failed after ${duration}ms for ${createUserDto.email}:`, error);
      // Re-throw HTTP exceptions as-is
      if (error.status) {
        throw error;
      }
      // Log unexpected errors
      throw error;
    }
  }

  @Post('register-client')
  async registerClient(@Body() registerClientDto: RegisterClientDto) {
    return this.authService.registerClient(registerClientDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    // Return full user data from database, not just JWT payload
    const userId = req.user.userId || req.user.id;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  async logout(@Body('refresh_token') refreshToken?: string) {
    await this.authService.logout(refreshToken);
    return { success: true };
  }
}
