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
import { CricketService } from './cricket.service';
import { CreateCricketDto } from './dto/create-cricket.dto';
import { UpdateCricketDto } from './dto/update-cricket.dto';
import { RegisterCricketDto } from './dto/register-cricket.dto';
import { JwtAuthGuard } from '../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/src/guards/roles.guard';
import { Roles } from '../auth/src/decorators/roles.decorator';
import { CurrentUser } from '../auth/src/decorators/current-user.decorator';
import { UserRole } from '../auth/src/users/user.entity';

@Controller('cricket')
@UseGuards(JwtAuthGuard)
export class CricketController {
  constructor(private readonly cricketService: CricketService) {}

  @Post('register')
  register(@Body() registerCricketDto: RegisterCricketDto) {
    return this.cricketService.register(registerCricketDto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createCricketDto: CreateCricketDto, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT && createCricketDto.client_id !== user.id) {
      throw new ForbiddenException('You can only create cricket facilities for yourself');
    }
    return this.cricketService.create(createCricketDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT) {
      return this.cricketService.findAll(user.id);
    }
    return this.cricketService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.cricketService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own cricket facilities');
    }
    return facility;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(@Param('id') id: string, @Body() updateCricketDto: UpdateCricketDto, @CurrentUser() user: any) {
    const facility = await this.cricketService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own cricket facilities');
    }
    return this.cricketService.update(id, updateCricketDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.cricketService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own cricket facilities');
    }
    return this.cricketService.remove(id);
  }
}
