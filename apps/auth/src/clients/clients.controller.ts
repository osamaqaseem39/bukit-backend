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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ClientStatus } from './client.entity';
import { UserRole } from '../users/user.entity';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('status') status?: ClientStatus) {
    return this.clientsService.findAll(status);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  getStatistics() {
    return this.clientsService.getStatistics();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.clientsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req,
  ) {
    // If not admin, verify ownership
    if (req.user.role !== UserRole.ADMIN) {
      const client = await this.clientsService.findOne(id);
      if (client.user_id !== req.user.id) {
        throw new ForbiddenException(
          'You can only update your own client profile',
        );
      }
      // Non-admins cannot update status or commission
      delete updateClientDto.status;
      delete updateClientDto.commission_rate;
    }
    return this.clientsService.update(id, updateClientDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string, @Request() req) {
    return this.clientsService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.clientsService.reject(id, reason, req.user.id);
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN)
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.clientsService.suspend(id, reason);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN)
  activate(@Param('id') id: string) {
    return this.clientsService.activate(id);
  }

  @Patch(':id/commission')
  @Roles(UserRole.ADMIN)
  updateCommission(@Param('id') id: string, @Body('rate') rate: number) {
    return this.clientsService.updateCommissionRate(id, rate);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
