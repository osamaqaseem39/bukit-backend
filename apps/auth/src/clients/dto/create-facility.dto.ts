import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { FacilityStatus, FacilityType } from '../facility.entity';

export class CreateFacilityDto {
  @IsString()
  name: string;

  @IsEnum(FacilityType)
  type: FacilityType;

  @IsOptional()
  @IsEnum(FacilityStatus)
  status?: FacilityStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}


