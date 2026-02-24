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
import { TableTennisService } from './table-tennis.service';
import { CreateTableTennisDto } from './dto/create-table-tennis.dto';
import { UpdateTableTennisDto } from './dto/update-table-tennis.dto';
import { RegisterTableTennisDto } from './dto/register-table-tennis.dto';
import { JwtAuthGuard } from '../../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/src/guards/roles.guard';
import { Roles } from '../../auth/src/decorators/roles.decorator';
import { CurrentUser } from '../../auth/src/decorators/current-user.decorator';
import { UserRole } from '../../auth/src/users/user.entity';

@Controller('table-tennis')
@UseGuards(JwtAuthGuard)
export class TableTennisController {
  constructor(private readonly tableTennisService: TableTennisService) {}

  @Post('register')
  register(@Body() registerTableTennisDto: RegisterTableTennisDto) {
    return this.tableTennisService.register(registerTableTennisDto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createTableTennisDto: CreateTableTennisDto, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT && createTableTennisDto.client_id !== user.id) {
      throw new ForbiddenException('You can only create table tennis facilities for yourself');
    }
    return this.tableTennisService.create(createTableTennisDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    if (user.role === UserRole.CLIENT) {
      return this.tableTennisService.findAll(user.id);
    }
    return this.tableTennisService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.tableTennisService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own table tennis facilities');
    }
    return facility;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(@Param('id') id: string, @Body() updateTableTennisDto: UpdateTableTennisDto, @CurrentUser() user: any) {
    const facility = await this.tableTennisService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own table tennis facilities');
    }
    return this.tableTennisService.update(id, updateTableTennisDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const facility = await this.tableTennisService.findOne(id);
    if (user.role === UserRole.CLIENT && facility.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own table tennis facilities');
    }
    return this.tableTennisService.remove(id);
  }
}
