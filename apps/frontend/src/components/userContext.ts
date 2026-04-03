import type { UserContext } from '../types/auth';

export const formatUserRole = (role: UserContext['role']): string => {
  switch (role) {
    case 'DataEntry':
      return 'Data Entry';
    case 'ReadOnly':
      return 'Read-Only';
    case 'SystemAdministrator':
      return 'System Administrator';
    default:
      return role;
  }
};

export const formatUserContext = (context: UserContext): string => {
  const roleLabel = formatUserRole(context.role);
  const locationLabel = context.locationName ?? 'Location unavailable';
  return `Welcome: ${context.name} (${roleLabel}) - ${locationLabel}`;
};
