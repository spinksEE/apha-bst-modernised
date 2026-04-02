import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import type { UserRole } from '@apha-bst/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps): React.JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.userLevel)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
