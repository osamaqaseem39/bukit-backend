import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../../bookings/booking.entity';
import { FacilityStatus, FacilityType } from '../../clients/facility.entity';
import { FacilityPricingDto } from './pricing.dto';

/** -------------------- Auth (Login screen) -------------------- */

export class LoginRequestDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class LoginResponseDto {
  @IsString()
  access_token: string;

  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsBoolean()
  requires_password_change?: boolean;
}

/** -------------------- Club/Location screens -------------------- */

export class LocationDto {
  @IsUUID()
  id: string;

  @IsUUID()
  client_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsString()
  state?: string | null;

  @IsOptional()
  @IsString()
  country?: string | null;

  @IsOptional()
  @IsString()
  postal_code?: string | null;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsArray()
  @IsEnum(FacilityType, { each: true })
  facility_types?: FacilityType[] | null;
}

export class FacilityDto {
  @IsUUID()
  id: string;

  @IsUUID()
  location_id: string;

  @IsString()
  name: string;

  @IsEnum(FacilityType)
  type: FacilityType;

  @IsEnum(FacilityStatus)
  status: FacilityStatus;

  /**
   * Pricing extracted from facility.metadata to power tabs:
   * Subscriptions / Packages / Per Minute.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => FacilityPricingDto)
  pricing?: FacilityPricingDto;

  /** Raw metadata still available for backwards compatibility. */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

/**
 * Data for the "club details" screen:
 * - Location header (name/address/types)
 * - Facilities list
 * - Pricing options per facility (tabs)
 */
export class ClubDetailsScreenDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityDto)
  facilities: FacilityDto[];

  /** Optional: cover images / gallery for the UI carousel. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

/** -------------------- Availability / Seat booking screens -------------------- */

export class AvailabilitySearchDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(FacilityType)
  facility_type?: FacilityType;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;
}

export class AvailableLocationDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityDto)
  available_facilities: FacilityDto[];
}

/**
 * Optional: seat map screen in your UI ("BOOK YOUR SEAT").
 * We treat each Facility as a "seat" for gaming centers.
 */
export class SeatDto {
  @IsUUID()
  id: string;

  @IsString()
  label: string;

  @IsEnum(FacilityType)
  type: FacilityType;

  @IsEnum(FacilityStatus)
  status: FacilityStatus;
}

export class SeatMapScreenDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];
}

/** -------------------- Booking details screen -------------------- */

export class BookingDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsUUID()
  location_id: string;

  @IsOptional()
  @IsUUID()
  facility_id?: string | null;

  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsOptional()
  @IsBoolean()
  is_walk_in?: boolean;

  @IsOptional()
  @IsString()
  guest_name?: string | null;

  @IsOptional()
  @IsString()
  guest_phone?: string | null;

  @IsOptional()
  @IsNumber()
  amount?: number | null;

  @IsOptional()
  @IsString()
  currency?: string | null;
}

export class BookingDetailsScreenDto {
  @ValidateNested()
  @Type(() => BookingDto)
  booking: BookingDto;

  /** Optional enrichments for the UI (not currently in your Booking entity). */
  @IsOptional()
  @IsString()
  booking_reference?: string; // e.g. FM17580

  @IsOptional()
  @IsString()
  instructor_name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  schedule_weeks?: number;
}

/** -------------------- Payment screen -------------------- */

export class PaymentSummaryDto {
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  fees: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  currency: string;
}

export class PaymentScreenDto {
  @ValidateNested()
  @Type(() => PaymentSummaryDto)
  summary: PaymentSummaryDto;

  @IsOptional()
  @IsString()
  promo_code?: string;

  /** Optional: whether user wants to save card for later. */
  @IsOptional()
  @IsBoolean()
  save_card?: boolean;
}

