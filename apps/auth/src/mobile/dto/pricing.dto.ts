import { IsArray, IsInt, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FacilityPackageDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  /** Total playable minutes (e.g. 60, 600). */
  @IsInt()
  @Min(1)
  minutes: number;

  /** Price for the full package (e.g. 500 PKR). */
  @IsNumber()
  @Min(0)
  price: number;

  /** ISO currency code (e.g. PKR, AED). */
  @IsString()
  currency: string;

  /** Optional validity window in hours (e.g. 168h shown in the UI). */
  @IsOptional()
  @IsInt()
  @Min(1)
  validity_hours?: number;
}

export class FacilitySubscriptionDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  /** Price for the subscription period. */
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  currency: string;

  /** Human-friendly duration label (e.g. "1 month", "10 weeks"). */
  @IsOptional()
  @IsString()
  duration_label?: string;

  /** Optional: total included minutes/hours if subscription has limits. */
  @IsOptional()
  @IsInt()
  @Min(1)
  included_minutes?: number;
}

export class FacilityPerMinutePricingDto {
  /** Rate per minute (e.g. 50 PKR/min). */
  @IsNumber()
  @Min(0)
  rate_per_minute: number;

  @IsString()
  currency: string;

  /** Billing increments (UI says "Money will be charged every 10 min"). */
  @IsInt()
  @Min(1)
  billing_interval_minutes: number;

  /** Optional minimum chargeable minutes. */
  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_minutes?: number;
}

/**
 * Strongly-typed view of facility.metadata pricing data.
 * This is meant to power the "Subscriptions / Packages / Per Minute" tabs.
 */
export class FacilityPricingDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityPackageDto)
  packages?: FacilityPackageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilitySubscriptionDto)
  subscriptions?: FacilitySubscriptionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FacilityPerMinutePricingDto)
  per_minute?: FacilityPerMinutePricingDto;

  /** Any extra pricing-related metadata we don't model yet. */
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}

