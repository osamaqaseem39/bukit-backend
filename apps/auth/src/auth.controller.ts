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
    return this.authService.register(createUserDto);
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
}
