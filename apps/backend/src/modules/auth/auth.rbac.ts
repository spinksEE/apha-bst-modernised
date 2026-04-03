import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const RBAC_METADATA_KEY = 'rbac_roles';
export const READ_ONLY_METADATA_KEY = 'rbac_read_only';

export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(RBAC_METADATA_KEY, roles);

export const AllowReadOnly = () => SetMetadata(READ_ONLY_METADATA_KEY, true);
