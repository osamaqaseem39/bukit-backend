import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsOptional,
} from 'class-validator';

/**
 * User payload for register-client. Password is optional; backend generates a default if omitted.
 */
export class RegisterClientUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;
}
