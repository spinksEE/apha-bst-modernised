import type { UserRole } from '@prisma/client';

export type RoleRequirement = {
  allowedRoles: UserRole[];
  allowReadOnly: boolean;
};
