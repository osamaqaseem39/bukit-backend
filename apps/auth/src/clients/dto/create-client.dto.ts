import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientStatus } from '../client.entity';

class BusinessHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsOptional()
  is_closed?: boolean;
}

class PaymentDetailsDto {
  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  account_holder_name?: string;

  @IsOptional()
  @IsString()
  routing_number?: string;
}

export class CreateClientDto {
  @IsString()
  user_id: string;

  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  contact_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  company_registration_number?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

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
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  business_hours?: {
    [key: string]: BusinessHoursDto;
  };

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  payment_details?: PaymentDetailsDto;
}
