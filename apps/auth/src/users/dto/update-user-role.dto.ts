import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '../user.entity';
import { UpdateUserModulesDto } from './update-user-modules.dto';

export class UpdateUserRoleDto extends UpdateUserModulesDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  /** When role is location_manager, set the location this user manages. Omit or set null to clear. */
  @IsOptional()
  @IsUUID()
  managed_location_id?: string | null;
}
