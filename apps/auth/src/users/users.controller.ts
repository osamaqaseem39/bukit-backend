import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from './user.entity';
import { UpdateUserModulesDto } from './dto/update-user-modules.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List users based on requester's role:
   * - Super admin: all users
   * - Client admin: users in their domain
   * - Regular admin: all users
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  findAll(@Request() req) {
    const requesterId = req.user.userId || req.user.id;
    const requesterRole = req.user.role;
    return this.usersService.findAllSafe(requesterId, requesterRole);
  }

  /**
   * Get a single user by ID.
   * Super admin and regular admin can access anyone.
   * Client admin can only access users in their domain.
   */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @Request() req) {
    const requesterId = req.user.userId || req.user.id;
    const requesterRole = req.user.role;
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // Check permissions
    if (!this.usersService.canAccessUser(requesterId, requesterRole, id, user.client_id)) {
      throw new BadRequestException('You do not have permission to access this user');
    }
    return this.usersService.findOneSafe(id);
  }

  /**
   * Create a new user.
   * Super admin can create anyone.
   * Client admin can create users in their domain.
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const requesterId = req.user.userId || req.user.id;
    const requesterRole = req.user.role;
    
    // Client admin can only create users in their domain
    const clientId = requesterRole === 'client' ? requesterId : null;
    
    // Client admin cannot create super admins or regular admins
    if (requesterRole === 'client' && (createUserDto.role === UserRole.SUPER_ADMIN || createUserDto.role === UserRole.ADMIN)) {
      throw new BadRequestException('You cannot create admin users');
    }
    
    const user = await this.usersService.create(createUserDto, clientId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Replace the set of dashboard modules for a user.
   *
   * - Send `{ "modules": [...] }` to set modules.
   * - Send `{ "modules": [] }` to clear modules (frontend falls back to role).
   */
  @Patch(':id/modules')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  async updateModules(
    @Param('id') id: string,
    @Body() updateUserModulesDto: UpdateUserModulesDto,
    @Request() req,
  ) {
    const requesterId = req.user.userId || req.user.id;
    const requesterRole = req.user.role;
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // Check permissions
    if (!this.usersService.canAccessUser(requesterId, requesterRole, id, user.client_id)) {
      throw new BadRequestException('You do not have permission to update this user');
    }
    return this.usersService.updateModules(id, updateUserModulesDto.modules);
  }

  /**
   * Update a user's role and/or modules.
   * Super admin can update anyone.
   * Client admin can only update users in their domain and cannot assign admin roles.
   */
  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req,
  ) {
    const requesterId = req.user.userId || req.user.id;
    const requesterRole = req.user.role;
    return this.usersService.updateRoleAndModules(
      id,
      updateUserRoleDto.role,
      updateUserRoleDto.modules,
      requesterId,
      requesterRole,
    );
  }

  /**
   * Update a user's password.
   */
  @Patch(':id/password')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @Request() req,
  ) {
    if (!password || password.trim().length === 0) {
      throw new BadRequestException('Password is required');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const requesterId = req.user.userId || req.user.id;
    const requesterRole = req.user.role;
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // Check permissions
    if (!this.usersService.canAccessUser(requesterId, requesterRole, id, user.client_id)) {
      throw new BadRequestException('You do not have permission to update this user');
    }
    return this.usersService.updatePassword(id, password);
  }
}

