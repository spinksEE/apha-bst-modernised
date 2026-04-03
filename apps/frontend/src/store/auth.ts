import { create } from 'zustand';
import type { UserContext } from '../types/auth';

const ACCESS_TOKEN_KEY = 'bst_access_token';

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    return;
  }
};

interface AuthState {
  accessToken: string | null;
  userContext: UserContext | null;
  referenceId: string | null;
  setSession: (token: string, context: UserContext) => void;
  clearSession: () => void;
  setReferenceId: (referenceId: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStoredToken(),
  userContext: null,
  referenceId: null,
  setSession: (token, context) => {
    persistToken(token);
    set({ accessToken: token, userContext: context, referenceId: null });
  },
  clearSession: () => {
    persistToken(null);
    set({ accessToken: null, userContext: null, referenceId: null });
  },
  setReferenceId: (referenceId) => set({ referenceId }),
}));
