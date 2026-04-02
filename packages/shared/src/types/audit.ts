export enum AuditEventType {
  Login = 'Login',
  Logout = 'Logout',
  LoginFailed = 'LoginFailed',
  AccessDenied = 'AccessDenied',
  ScreenAccess = 'ScreenAccess',
}

export interface AuditLog {
  logId: number;
  userId: number | null;
  timestamp: Date;
  eventType: AuditEventType;
  details: string;
  ipAddress: string;
  sessionId: string | null;
}
