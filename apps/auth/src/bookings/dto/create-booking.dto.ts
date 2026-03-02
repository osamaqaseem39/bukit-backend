import { BookingStatus } from '../booking.entity';

export class CreateBookingDto {
  location_id: string;
  facility_id?: string;
  start_time: Date | string;
  end_time: Date | string;
  status?: BookingStatus;
  is_walk_in?: boolean;
  guest_name?: string;
  guest_phone?: string;
  amount?: number;
  currency?: string;
}

