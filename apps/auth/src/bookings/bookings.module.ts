import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { LedgerController } from './ledger.controller';
import { ReportsController } from './reports.controller';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), ClientsModule],
  controllers: [BookingsController, LedgerController, ReportsController],
  providers: [BookingsService],
})
export class BookingsModule {}

