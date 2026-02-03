import { PartialType } from '@nestjs/mapped-types';
import { CreateSnookerDto } from './create-snooker.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SnookerStatus } from '../snooker.entity';

export class UpdateSnookerDto extends PartialType(CreateSnookerDto) {
  @IsOptional()
  @IsEnum(SnookerStatus)
  status?: SnookerStatus;
}
