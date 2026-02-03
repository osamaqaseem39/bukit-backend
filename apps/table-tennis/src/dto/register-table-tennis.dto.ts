import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../../auth/src/users/dto/create-user.dto';
import { CreateTableTennisDto } from './create-table-tennis.dto';

export class RegisterTableTennisDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateUserDto)
  admin: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateTableTennisDto)
  tableTennis: Omit<CreateTableTennisDto, 'client_id' | 'admin_id'>;
}
