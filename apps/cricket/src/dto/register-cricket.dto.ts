import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../../auth/src/users/dto/create-user.dto';
import { CreateCricketDto } from './create-cricket.dto';

export class RegisterCricketDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateUserDto)
  admin: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateCricketDto)
  cricket: Omit<CreateCricketDto, 'client_id' | 'admin_id'>;
}
