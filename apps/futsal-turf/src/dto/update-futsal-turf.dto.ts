import { PartialType } from '@nestjs/mapped-types';
import { CreateFutsalTurfDto } from './create-futsal-turf.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { FutsalTurfStatus } from '../futsal-turf.entity';

export class UpdateFutsalTurfDto extends PartialType(CreateFutsalTurfDto) {
  @IsOptional()
  @IsEnum(FutsalTurfStatus)
  status?: FutsalTurfStatus;
}
