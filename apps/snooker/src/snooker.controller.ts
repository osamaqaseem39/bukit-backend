import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SnookerService } from './snooker.service';
import { CreateSnookerDto } from './dto/create-snooker.dto';
import { UpdateSnookerDto } from './dto/update-snooker.dto';
import { RegisterSnookerDto } from './dto/register-snooker.dto';
import { JwtAuthGuard } from '../../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/src/guards/roles.guard';
import { Roles } from '../../auth/src/decorators/roles.decorator';
import { CurrentUser } from '../../auth/src/decorators/current-user.decorator';
import { UserRole } from '../../auth/src/users/user.entity';

@Controller('snooker')
@UseGuards(JwtAuthGuard)
export class SnookerController {
  constructor(private readonly snookerService: SnookerService) {}

  @Post('register')
  register(@Body() registerSnookerDto: RegisterSnookerDto) {
    return this.snookerService.register(registerSnookerDto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createSnookerDto: CreateSnookerDto, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT && createSnookerDto.client_id !== user.id) {
      throw new ForbiddenException('You can only create snooker facilities for yourself');
    }
    return this.snookerService.create(createSnookerDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT) {
      return this.snookerService.findAll(user.id);
    }
    return this.snookerService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.snookerService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own snooker facilities');
    }
    return facility;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(@Param('id') id: string, @Body() updateSnookerDto: UpdateSnookerDto, @CurrentUser() user: any) {
    const facility = await this.snookerService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own snooker facilities');
    }
    return this.snookerService.update(id, updateSnookerDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.snookerService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own snooker facilities');
    }
    return this.snookerService.remove(id);
  }
}
