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
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createLocationDto: CreateLocationDto, @CurrentUser() user: any) {
    try {
      // Validate user exists
      if (!user) {
        throw new BadRequestException('User not found');
      }

      return await this.locationsService.create(createLocationDto);
    } catch (error) {
      this.logger.error('Error creating location', error);
      
      // Re-throw known exceptions
      if (error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }

      // Handle database constraint violations
      if (error?.code === '23503') {
        // Foreign key constraint violation
        throw new BadRequestException(
          `Invalid client_id: ${createLocationDto.client_id}. The client does not exist.`
        );
      }

      // Handle validation errors
      if (error?.response?.statusCode === 400) {
        throw error;
      }

      // Generic error handling
      throw new InternalServerErrorException(
        error?.message || 'Failed to create location'
      );
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    // CLIENT can only see their own locations
    if (user.role === UserRole.CLIENT) {
      return this.locationsService.findAll(user.id);
    }
    // ADMIN can see all or filter by clientId
    return this.locationsService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const location = await this.locationsService.findOne(id);
    
    // CLIENT can only access their own locations
    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException('You can only access your own locations');
    }
    
    return location;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() user: any,
  ) {
    const location = await this.locationsService.findOne(id);
    
    // CLIENT can only update their own locations
    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException('You can only update your own locations');
    }
    
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const location = await this.locationsService.findOne(id);
    
    // CLIENT can only delete their own locations
    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException('You can only delete your own locations');
    }
    
    return this.locationsService.remove(id);
  }
}
