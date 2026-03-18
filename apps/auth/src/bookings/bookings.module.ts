import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { LedgerController } from './ledger.controller';
import { ReportsController } from './reports.controller';
import { ClientsModule } from '../clients/clients.module';
import { Facility } from '../clients/facility.entity';
import { Location } from '../clients/location.entity';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Facility, Location]), ClientsModule],
  controllers: [BookingsController, LedgerController, ReportsController, SearchController],
  providers: [BookingsService],
})
export class BookingsModule {}

