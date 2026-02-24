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
import { FutsalTurfService } from './futsal-turf.service';
import { CreateFutsalTurfDto } from './dto/create-futsal-turf.dto';
import { UpdateFutsalTurfDto } from './dto/update-futsal-turf.dto';
import { RegisterFutsalTurfDto } from './dto/register-futsal-turf.dto';
import { JwtAuthGuard } from '../../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/src/guards/roles.guard';
import { Roles } from '../../auth/src/decorators/roles.decorator';
import { CurrentUser } from '../../auth/src/decorators/current-user.decorator';
import { UserRole } from '../../auth/src/users/user.entity';

@Controller('futsal-turf')
@UseGuards(JwtAuthGuard)
export class FutsalTurfController {
  constructor(private readonly futsalTurfService: FutsalTurfService) {}

  @Post('register')
  register(@Body() registerFutsalTurfDto: RegisterFutsalTurfDto) {
    return this.futsalTurfService.register(registerFutsalTurfDto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createFutsalTurfDto: CreateFutsalTurfDto, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT && createFutsalTurfDto.client_id !== user.id) {
      throw new ForbiddenException('You can only create futsal turf facilities for yourself');
    }
    return this.futsalTurfService.create(createFutsalTurfDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT) {
      return this.futsalTurfService.findAll(user.id);
    }
    return this.futsalTurfService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.futsalTurfService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own futsal turf facilities');
    }
    return facility;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(@Param('id') id: string, @Body() updateFutsalTurfDto: UpdateFutsalTurfDto, @CurrentUser() user: any) {
    const facility = await this.futsalTurfService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own futsal turf facilities');
    }
    return this.futsalTurfService.update(id, updateFutsalTurfDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.futsalTurfService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own futsal turf facilities');
    }
    return this.futsalTurfService.remove(id);
  }
}
