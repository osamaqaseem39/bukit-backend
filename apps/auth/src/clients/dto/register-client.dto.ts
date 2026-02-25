import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RegisterClientUserDto } from './register-client-user.dto';
import { RegisterCreateClientDto } from './create-client.dto';

export class RegisterClientDto {
  @ValidateNested()
  @Type(() => RegisterClientUserDto)
  user: RegisterClientUserDto;

  @ValidateNested()
  @Type(() => RegisterCreateClientDto)
  client: RegisterCreateClientDto;
}
