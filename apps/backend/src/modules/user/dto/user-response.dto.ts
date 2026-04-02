import { UserLevel } from '@prisma/client';

export class UserResponseDto {
  userId!: number;
  userName!: string;
  userLevel!: UserLevel;
  userLocation!: number;
  locationName!: string;
}
