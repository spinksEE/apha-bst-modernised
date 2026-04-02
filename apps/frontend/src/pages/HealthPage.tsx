import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../api/health';
import type { HealthResponse } from '../types/health';

export function HealthPage(): React.JSX.Element {
  const { data, error, isLoading } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
  });

  if (isLoading) {
    return <pre data-testid="health-loading">Loading...</pre>;
  }

  if (error) {
    const errorResponse: HealthResponse = {
      status: 'error',
      database: 'unknown',
      uptime: 0,
    };
    return (
      <pre data-testid="health-response">
        {JSON.stringify(errorResponse, null, 2)}
      </pre>
    );
  }

  return (
    <pre data-testid="health-response">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
