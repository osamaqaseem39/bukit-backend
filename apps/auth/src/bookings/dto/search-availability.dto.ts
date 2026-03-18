import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { FacilityType } from '../../clients/facility.entity';

export class SearchAvailabilityDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  facility_type?: FacilityType;

  @IsISO8601()
  start_time: string;

  @IsISO8601()
  end_time: string;
}

