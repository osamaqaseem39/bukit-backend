import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { BookingsService } from './bookings.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('bookings')
  getBookingsReport(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Query('location_id') locationId: string | undefined,
    @Query('facility_id') facilityId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.getBookingsReport(
      {
        from,
        to,
        location_id: locationId,
        facility_id: facilityId,
      },
      user,
    );
  }
}

