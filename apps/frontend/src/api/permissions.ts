import { apiClient } from './client';
import type { DataEntryPermission } from '@apha-bst/shared';

export async function fetchUserPermissions(
  userId: number,
): Promise<DataEntryPermission[]> {
  const response = await apiClient.get<DataEntryPermission[]>(
    `/users/${userId}/permissions`,
  );
  return response.data;
}
