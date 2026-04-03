import axios from 'axios';
import type { LoginRequest, LoginResponse, SessionResponse, UserContext } from '../types/auth';
import { UserRole } from '@apha-bst/shared';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && Object.values(UserRole).includes(value as UserRole);

const isUserContext = (value: unknown): value is UserContext => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.userId === 'string' &&
    typeof value.name === 'string' &&
    isUserRole(value.role) &&
    typeof value.locationId === 'string' &&
    (value.locationName === undefined || typeof value.locationName === 'string')
  );
};

const assertLoginResponse = (value: unknown): LoginResponse => {
  if (!isRecord(value)) {
    throw new Error('Invalid login response');
  }

  if (typeof value.accessToken !== 'string' || !isUserContext(value.userContext)) {
    throw new Error('Invalid login response');
  }

  return value as LoginResponse;
};

const assertSessionResponse = (value: unknown): SessionResponse => {
  if (!isRecord(value) || !isUserContext(value.userContext)) {
    throw new Error('Invalid session response');
  }

  return value as SessionResponse;
};

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>('/api/auth/login', request);
  return assertLoginResponse(response.data);
}

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

export async function fetchSession(): Promise<SessionResponse> {
  const response = await axios.get<SessionResponse>('/api/auth/session');
  return assertSessionResponse(response.data);
}
