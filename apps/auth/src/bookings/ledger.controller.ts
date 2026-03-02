import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { BookingsService } from './bookings.service';

@Controller('ledger')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LedgerController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('daily')
  getDaily(
    @Query('date') date: string | undefined,
    @Query('location_id') locationId: string | undefined,
    @Query('facility_id') facilityId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.getDailyLedger(
      {
        date,
        location_id: locationId,
        facility_id: facilityId,
      },
      user,
    );
  }
}

