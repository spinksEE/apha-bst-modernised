import axios, { AxiosHeaders } from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/auth.store';
import { UserRole } from '@apha-bst/shared';
import type { AuthenticatedUser } from '@apha-bst/shared';
import { apiClient } from './client';

const mockUser: AuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: UserRole.Supervisor,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'test-session-123',
};

describe('apiClient interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('attaches Bearer token when token is present', async () => {
    useAuthStore.getState().setAuth('my-jwt-token', mockUser);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (apiClient.interceptors.request as any).handlers[0];
    const config = await handler.fulfilled!({
      headers: new AxiosHeaders(),
    } as never);

    expect(config.headers.Authorization).toBe('Bearer my-jwt-token');
  });

  it('sends no auth header when token is absent', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (apiClient.interceptors.request as any).handlers[0];
    const config = await handler.fulfilled!({
      headers: new AxiosHeaders(),
    } as never);

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('clears auth and redirects on 401 response', async () => {
    useAuthStore.getState().setAuth('my-jwt-token', mockUser);

    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { href: '/' },
      writable: true,
    });

    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (apiClient.interceptors.response as any).handlers[0];
    const error = { response: { status: 401 }, isAxiosError: true };

    await expect(handler.rejected!(error)).rejects.toBe(error);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.location.href).toBe('/login');

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });
});
