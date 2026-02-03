import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@Controller('locations/:locationId/facilities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  create(
    @Param('locationId') locationId: string,
    @Body() createFacilityDto: CreateFacilityDto,
    @CurrentUser() user: any,
  ) {
    return this.facilitiesService.createForLocation(locationId, createFacilityDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  findAll(
    @Param('locationId') locationId: string,
    @CurrentUser() user: any,
  ) {
    return this.facilitiesService.findAllForLocation(locationId, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  findOne(
    @Param('locationId') locationId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.facilitiesService.findOneForLocation(locationId, id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  update(
    @Param('locationId') locationId: string,
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
    @CurrentUser() user: any,
  ) {
    return this.facilitiesService.updateForLocation(
      locationId,
      id,
      updateFacilityDto,
      user,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  remove(
    @Param('locationId') locationId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.facilitiesService.removeForLocation(locationId, id, user);
  }
}

