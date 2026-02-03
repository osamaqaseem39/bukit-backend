import { PartialType } from '@nestjs/mapped-types';
import { CreateGamingDto } from './create-gaming.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { GamingStatus } from '../gaming.entity';

export class UpdateGamingDto extends PartialType(CreateGamingDto) {
  @IsOptional()
  @IsEnum(GamingStatus)
  status?: GamingStatus;
}
