import axios from 'axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth';

axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as { referenceId?: string } | undefined;
    const authStore = useAuthStore.getState();

    if (status === 401) {
      authStore.clearSession();
    } else if (status === 403) {
      authStore.setReferenceId(data?.referenceId ?? null);
    }

    return Promise.reject(error);
  },
);
