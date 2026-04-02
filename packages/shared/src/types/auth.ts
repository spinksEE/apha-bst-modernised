import { UserRole } from './user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    userId: number;
    userName: string;
    userLevel: UserRole;
    userLocation: number;
    locationName: string;
  };
}

export interface AuthenticatedUser {
  userId: number;
  userName: string;
  userLevel: UserRole;
  userLocation: number;
  locationName: string;
  sessionId: string;
}
