import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { UserRole } from '@apha-bst/shared';
import type { AuthenticatedUser } from '@apha-bst/shared';

const mockUser: AuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: UserRole.Supervisor,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'test-session-123',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('initialises as unauthenticated when localStorage is empty', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth stores token and user in state and localStorage', () => {
    useAuthStore.getState().setAuth('jwt-token-abc', mockUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('jwt-token-abc');
    expect(state.user).toEqual(mockUser);
    expect(localStorage.getItem('bst_token')).toBe('jwt-token-abc');
    expect(JSON.parse(localStorage.getItem('bst_user')!)).toEqual(mockUser);
  });

  it('clearAuth removes token and user from state and localStorage', () => {
    useAuthStore.getState().setAuth('jwt-token-abc', mockUser);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('bst_token')).toBeNull();
    expect(localStorage.getItem('bst_user')).toBeNull();
  });

  it('getToken returns current token', () => {
    useAuthStore.getState().setAuth('jwt-token-abc', mockUser);
    expect(useAuthStore.getState().getToken()).toBe('jwt-token-abc');
  });

  it('getToken returns null when not authenticated', () => {
    expect(useAuthStore.getState().getToken()).toBeNull();
  });
});
