import { SetMetadata } from '@nestjs/common';
import { UserLevel } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserLevel[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
