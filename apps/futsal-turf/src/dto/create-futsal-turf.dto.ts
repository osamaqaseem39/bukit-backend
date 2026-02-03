import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsEnum,
  IsUUID,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FutsalTurfStatus } from '../futsal-turf.entity';

class BusinessHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsOptional()
  is_closed?: boolean;
}

export class CreateFutsalTurfDto {
  @IsUUID()
  client_id: string;

  @IsUUID()
  admin_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsEnum(FutsalTurfStatus)
  status?: FutsalTurfStatus;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  number_of_turfs?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  business_hours?: {
    [key: string]: BusinessHoursDto;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourly_rate?: number;
}
