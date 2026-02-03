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
import { PadelService } from './padel.service';
import { CreatePadelDto } from './dto/create-padel.dto';
import { UpdatePadelDto } from './dto/update-padel.dto';
import { RegisterPadelDto } from './dto/register-padel.dto';
import { JwtAuthGuard } from '../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/src/guards/roles.guard';
import { Roles } from '../auth/src/decorators/roles.decorator';
import { CurrentUser } from '../auth/src/decorators/current-user.decorator';
import { UserRole } from '../auth/src/users/user.entity';

@Controller('padel')
@UseGuards(JwtAuthGuard)
export class PadelController {
  constructor(private readonly padelService: PadelService) {}

  @Post('register')
  register(@Body() registerPadelDto: RegisterPadelDto) {
    return this.padelService.register(registerPadelDto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createPadelDto: CreatePadelDto, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT && createPadelDto.client_id !== user.id) {
      throw new ForbiddenException('You can only create padel facilities for yourself');
    }
    return this.padelService.create(createPadelDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT) {
      return this.padelService.findAll(user.id);
    }
    return this.padelService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.padelService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own padel facilities');
    }
    return facility;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(@Param('id') id: string, @Body() updatePadelDto: UpdatePadelDto, @CurrentUser() user: any) {
    const facility = await this.padelService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own padel facilities');
    }
    return this.padelService.update(id, updatePadelDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.padelService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own padel facilities');
    }
    return this.padelService.remove(id);
  }
}
