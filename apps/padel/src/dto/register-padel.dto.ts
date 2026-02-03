import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../../auth/src/users/dto/create-user.dto';
import { CreatePadelDto } from './create-padel.dto';

export class RegisterPadelDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateUserDto)
  admin: CreateUserDto;

  @ValidateNested()
  @Type(() => CreatePadelDto)
  padel: Omit<CreatePadelDto, 'client_id' | 'admin_id'>;
}
