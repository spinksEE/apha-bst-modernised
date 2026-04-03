import type { UserRole } from '@prisma/client';
import type { RoleRequirement } from './auth.rbac.types';

export const requireRoles = (
  roles: UserRole[],
  options?: { allowReadOnly?: boolean },
): RoleRequirement => ({
  allowedRoles: roles,
  allowReadOnly: options?.allowReadOnly ?? false,
});
