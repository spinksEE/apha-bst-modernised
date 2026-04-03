import { useQuery } from '@tanstack/react-query';
import { fetchSession } from '../api/auth';
import { useAuthStore } from '../store/auth';
import type { SessionResponse } from '../types/auth';

interface SessionBootstrapResult {
  isLoading: boolean;
}

export function useSessionBootstrap(): SessionBootstrapResult {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);

  const { isLoading } = useQuery<SessionResponse>({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    enabled: Boolean(accessToken),
    retry: false,
    onSuccess: (data) => {
      if (accessToken) {
        setSession(accessToken, data.userContext);
      }
    },
  });

  return { isLoading };
}
