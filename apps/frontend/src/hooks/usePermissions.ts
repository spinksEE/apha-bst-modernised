import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@apha-bst/shared';
import { useAuthStore } from '../stores/auth.store';
import { fetchUserPermissions } from '../api/permissions';

/**
 * Returns true if the current user has the ReadOnly role.
 */
export function useIsReadOnly(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.userLevel === UserRole.ReadOnly;
}

/**
 * For DataEntry users, queries the permissions endpoint to check if they
 * can write to a specific screen. Supervisors always return true.
 * ReadOnly users always return false.
 */
export function useCanWrite(screenName: string): {
  canWrite: boolean;
  isLoading: boolean;
} {
  const user = useAuthStore((s) => s.user);

  const isSupervisor = user?.userLevel === UserRole.Supervisor;
  const isReadOnly = user?.userLevel === UserRole.ReadOnly;
  const isDataEntry = user?.userLevel === UserRole.DataEntry;

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', user?.userId],
    queryFn: () => fetchUserPermissions(user!.userId),
    enabled: isDataEntry && !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isSupervisor) {
    return { canWrite: true, isLoading: false };
  }

  if (isReadOnly) {
    return { canWrite: false, isLoading: false };
  }

  // DataEntry user — check screen-level permissions
  if (isLoading) {
    return { canWrite: false, isLoading: true };
  }

  const permission = permissions?.find((p) => p.screenName === screenName);
  return { canWrite: permission?.canWrite ?? false, isLoading: false };
}
