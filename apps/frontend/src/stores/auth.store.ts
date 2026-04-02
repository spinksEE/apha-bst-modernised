import { create } from 'zustand';
import type { AuthenticatedUser } from '@apha-bst/shared';

const TOKEN_KEY = 'bst_token';
const USER_KEY = 'bst_user';

interface AuthState {
  token: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthenticatedUser) => void;
  clearAuth: () => void;
  getToken: () => string | null;
}

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function loadUser(): AuthenticatedUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const token = loadToken();
  const user = loadUser();

  return {
    token,
    user,
    isAuthenticated: token !== null && user !== null,

    setAuth: (token: string, user: AuthenticatedUser) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    clearAuth: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    },

    getToken: () => get().token,
  };
});
