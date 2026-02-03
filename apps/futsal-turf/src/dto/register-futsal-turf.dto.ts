import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../../auth/src/users/dto/create-user.dto';
import { CreateFutsalTurfDto } from './create-futsal-turf.dto';

export class RegisterFutsalTurfDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateUserDto)
  admin: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateFutsalTurfDto)
  futsalTurf: Omit<CreateFutsalTurfDto, 'client_id' | 'admin_id'>;
}
