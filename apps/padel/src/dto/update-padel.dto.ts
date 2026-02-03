import { PartialType } from '@nestjs/mapped-types';
import { CreatePadelDto } from './create-padel.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PadelStatus } from '../padel.entity';

export class UpdatePadelDto extends PartialType(CreatePadelDto) {
  @IsOptional()
  @IsEnum(PadelStatus)
  status?: PadelStatus;
}
