import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateClientDto } from './create-client.dto';

export class RegisterClientDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;
}
