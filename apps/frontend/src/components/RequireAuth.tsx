import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionBootstrap } from '../hooks/useSessionBootstrap';
import { useAuthStore } from '../store/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps): React.JSX.Element {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userContext = useAuthStore((state) => state.userContext);
  const referenceId = useAuthStore((state) => state.referenceId);
  const { isLoading } = useSessionBootstrap();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  if (referenceId) {
    return <Navigate to="/access-denied" replace />;
  }

  if (!userContext) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
