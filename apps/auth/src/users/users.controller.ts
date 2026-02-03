import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from './user.entity';
import { UpdateUserModulesDto } from './dto/update-user-modules.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List all users (admin only).
   */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Get a single user by ID (admin only).
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneSafe(id);
  }

  /**
   * Replace the set of dashboard modules for a user (admin only).
   *
   * - Send `{ "modules": [...] }` to set modules.
   * - Send `{ "modules": [] }` to clear modules (frontend falls back to role).
   */
  @Patch(':id/modules')
  @Roles(UserRole.ADMIN)
  updateModules(
    @Param('id') id: string,
    @Body() updateUserModulesDto: UpdateUserModulesDto,
  ) {
    return this.usersService.updateModules(id, updateUserModulesDto.modules);
  }
}

