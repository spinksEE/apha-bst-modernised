export enum UserRole {
  Supervisor = 'Supervisor',
  DataEntry = 'DataEntry',
  ReadOnly = 'ReadOnly',
}

export interface User {
  userId: number;
  userName: string;
  userLocation: number;
  userLevel: UserRole;
}

export interface APHALocation {
  locationId: number;
  locationName: string;
  isAHVLA: boolean;
}
