import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ClientStatus } from '../client.entity';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;
}
