import { PartialType } from '@nestjs/mapped-types';
import { CreateCricketDto } from './create-cricket.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CricketStatus } from '../cricket.entity';

export class UpdateCricketDto extends PartialType(CreateCricketDto) {
  @IsOptional()
  @IsEnum(CricketStatus)
  status?: CricketStatus;
}
