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
  Request,
} from '@nestjs/common';
import { GamingService } from './gaming.service';
import { CreateGamingDto } from './dto/create-gaming.dto';
import { UpdateGamingDto } from './dto/update-gaming.dto';
import { RegisterGamingDto } from './dto/register-gaming.dto';
import { JwtAuthGuard } from '../../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/src/guards/roles.guard';
import { Roles } from '../../auth/src/decorators/roles.decorator';
import { CurrentUser } from '../../auth/src/decorators/current-user.decorator';
import { UserRole } from '../../auth/src/users/user.entity';

@Controller('gaming')
@UseGuards(JwtAuthGuard)
export class GamingController {
  constructor(private readonly gamingService: GamingService) {}

  @Post('register')
  register(@Body() registerGamingDto: RegisterGamingDto) {
    // Anyone can register (creates new client/admin users)
    return this.gamingService.register(registerGamingDto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createGamingDto: CreateGamingDto, @CurrentUser() user: any) {
    // CLIENT can only create for themselves
    if (user.role === UserRole.CLIENT && createGamingDto.client_id !== user.id) {
      throw new ForbiddenException('You can only create gaming centers for yourself');
    }
    return this.gamingService.create(createGamingDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    // CLIENT can only see their own gaming centers
    if (user.role === UserRole.CLIENT) {
      return this.gamingService.findAll(user.id);
    }
    // ADMIN can see all or filter by clientId
    return this.gamingService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const gamingCenter = await this.gamingService.findOne(id);
    
    // CLIENT can only access their own gaming centers
    if (user.role === UserRole.CLIENT && gamingCenter.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own gaming centers');
    }
    
    return gamingCenter;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(
    @Param('id') id: string,
    @Body() updateGamingDto: UpdateGamingDto,
    @CurrentUser() user: any,
  ) {
    const gamingCenter = await this.gamingService.findOne(id);
    
    // CLIENT can only update their own gaming centers
    if (user.role === UserRole.CLIENT && gamingCenter.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own gaming centers');
    }
    
    return this.gamingService.update(id, updateGamingDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const gamingCenter = await this.gamingService.findOne(id);
    
    // CLIENT can only delete their own gaming centers
    if (user.role === UserRole.CLIENT && gamingCenter.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own gaming centers');
    }
    
    return this.gamingService.remove(id);
  }
}
