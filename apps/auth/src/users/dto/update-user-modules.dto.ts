import { IsArray, IsOptional, IsString } from 'class-validator';
import { UserDashboardModule } from '../user.entity';

export class UpdateUserModulesDto {
  /**
   * Full list of modules the user should have.
   *
   * - Pass an empty array (`[]`) to clear all modules (fallback to role-based).
   * - Omit the field or pass `null` (from JSON) to leave modules unchanged.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modules?: UserDashboardModule[] | null;
}

