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
import { ClientsService } from './clients.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { LocationRequestsService } from './location-requests.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(
    private readonly locationsService: LocationsService,
    private readonly clientsService: ClientsService,
    private readonly locationRequestsService: LocationRequestsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() createLocationDto: CreateLocationDto, @CurrentUser() user: any) {
    try {
      // Validate user exists
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // CLIENTs cannot create locations directly; they create a request instead
      if (user.role === UserRole.CLIENT) {
        const client = await this.clientsService.findByUserId(user.id);
        if (!client) {
          throw new BadRequestException(
            'Client profile not found for the current user',
          );
        }

        const { client_id: _ignoredClientId, ...rest } = createLocationDto;

        return await this.locationRequestsService.createForClient(
          client.id,
          rest,
        );
      }

      // Only ADMIN can create locations directly
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Only admins can create locations directly',
        );
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

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllRequests() {
    return this.locationRequestsService.findAllPending();
  }

  @Post('requests/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveRequest(@Param('id') id: string) {
    await this.locationRequestsService.approve(id);
    return { success: true };
  }

  @Post('requests/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectRequest(@Param('id') id: string) {
    await this.locationRequestsService.reject(id);
    return { success: true };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT, UserRole.LOCATION_MANAGER)
  async findAll(@Query('clientId') clientId: string, @CurrentUser() user: any) {
    // LOCATION_MANAGER can only see their own managed location
    if (user.role === UserRole.LOCATION_MANAGER) {
      if (!user.managed_location_id) {
        throw new ForbiddenException('You are not assigned to a location');
      }
      const location = await this.locationsService.findOne(
        user.managed_location_id,
      );
      return [location];
    }

    // CLIENT can only see their own locations
    if (user.role === UserRole.CLIENT) {
      const client = await this.clientsService.findByUserId(user.id);
      if (!client) {
        throw new BadRequestException(
          'Client profile not found for the current user',
        );
      }

      return this.locationsService.findAll(client.id);
    }
    // ADMIN can see all or filter by clientId
    return this.locationsService.findAll(clientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT, UserRole.LOCATION_MANAGER)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const location = await this.locationsService.findOne(id);

    // LOCATION_MANAGER can only access their own location
    if (user.role === UserRole.LOCATION_MANAGER) {
      if (user.managed_location_id !== id) {
        throw new ForbiddenException(
          'You can only access your assigned location',
        );
      }
      return location;
    }

    // CLIENT can only access their own locations
    if (user.role === UserRole.CLIENT) {
      const client = await this.clientsService.findByUserId(user.id);
      if (!client || location.client_id !== client.id) {
        throw new ForbiddenException('You can only access your own locations');
      }
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
    if (user.role === UserRole.CLIENT) {
      const client = await this.clientsService.findByUserId(user.id);
      if (!client || location.client_id !== client.id) {
        throw new ForbiddenException('You can only update your own locations');
      }
    }

    // LOCATION_MANAGER cannot update locations (read-only)
    if (user.role === UserRole.LOCATION_MANAGER) {
      throw new ForbiddenException(
        'Location managers cannot update location details',
      );
    }

    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const location = await this.locationsService.findOne(id);

    // CLIENT can only delete their own locations
    if (user.role === UserRole.CLIENT) {
      const client = await this.clientsService.findByUserId(user.id);
      if (!client || location.client_id !== client.id) {
        throw new ForbiddenException('You can only delete your own locations');
      }
    }

    // LOCATION_MANAGER cannot delete locations
    if (user.role === UserRole.LOCATION_MANAGER) {
      throw new ForbiddenException(
        'Location managers cannot delete locations',
      );
    }

    return this.locationsService.remove(id);
  }
}
