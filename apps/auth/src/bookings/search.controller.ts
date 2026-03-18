import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { SearchAvailabilityDto } from './dto/search-availability.dto';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('availability')
  searchAvailability(@Query() query: SearchAvailabilityDto) {
    return this.bookingsService.searchAvailability(query);
  }
}

