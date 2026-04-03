import type { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  userId: string;
  name: string;
  role: UserRole;
  locationId: string;
  locationName?: string;
  sessionId: string;
};

export type AuthAccessResult = {
  accessToken: string;
  userContext: {
    userId: string;
    name: string;
    role: UserRole;
    locationId: string;
    locationName?: string;
  };
};
