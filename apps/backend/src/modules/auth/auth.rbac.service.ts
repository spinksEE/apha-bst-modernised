import { Injectable } from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import type { RoleRequirement } from './auth.rbac.types';

@Injectable()
export class AuthRbacService {
  canWrite(role: UserRole): boolean {
    return role !== 'ReadOnly';
  }

  isRoleAllowed(role: UserRole, requirement?: RoleRequirement): boolean {
    if (!requirement || requirement.allowedRoles.length === 0) {
      return true;
    }
    if (!requirement.allowedRoles.includes(role)) {
      return false;
    }
    if (role === 'ReadOnly' && !requirement.allowReadOnly) {
      return false;
    }
    return true;
  }
}
