import { PartialType } from '@nestjs/mapped-types';
import { CreateTableTennisDto } from './create-table-tennis.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TableTennisStatus } from '../table-tennis.entity';

export class UpdateTableTennisDto extends PartialType(CreateTableTennisDto) {
  @IsOptional()
  @IsEnum(TableTennisStatus)
  status?: TableTennisStatus;
}
