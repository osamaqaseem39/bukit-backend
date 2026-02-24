import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../user.entity';
import { UpdateUserModulesDto } from './update-user-modules.dto';

export class UpdateUserRoleDto extends UpdateUserModulesDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
