export enum UserRole {
  Supervisor = "Supervisor",
  DataEntry = "DataEntry",
  ReadOnly = "ReadOnly",
  SystemAdministrator = "SystemAdministrator",
}

export type UserContext = {
  userId: string;
  name: string;
  role: UserRole;
  locationId: string;
  locationName?: string;
};

export type AuthTokenPayload = {
  sub: string;
  name: string;
  role: UserRole;
  locationId: string;
  locationName?: string;
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  userContext: UserContext;
};

export type SessionResponse = {
  userContext: UserContext;
};

export type AuthErrorResponse = {
  message: string;
  referenceId?: string;
};
