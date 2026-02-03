import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../../auth/src/users/dto/create-user.dto';
import { CreateSnookerDto } from './create-snooker.dto';

export class RegisterSnookerDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateUserDto)
  admin: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateSnookerDto)
  snooker: Omit<CreateSnookerDto, 'client_id' | 'admin_id'>;
}
