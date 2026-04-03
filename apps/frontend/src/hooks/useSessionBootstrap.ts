import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchSession } from '../api/auth';
import { useAuthStore } from '../store/auth';
import type { SessionResponse } from '../types/auth';

interface SessionBootstrapResult {
  isLoading: boolean;
}

export function useSessionBootstrap(): SessionBootstrapResult {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);

  const { data, isLoading } = useQuery<SessionResponse>({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    enabled: Boolean(accessToken),
    retry: false,
  });

  useEffect(() => {
    if (accessToken && data) {
      setSession(accessToken, data.userContext);
    }
  }, [accessToken, data, setSession]);

  return { isLoading };
}
