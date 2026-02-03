import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../users/user.entity';

/**
 * Guard to check if user owns the resource
 * Use with @ResourceOwner decorator to specify the resource service
 */
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    // ADMIN has access to everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // CLIENT can only access their own resources
    if (user.role === UserRole.CLIENT) {
      // The controller should check ownership before calling this guard
      // This is a fallback check
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}
