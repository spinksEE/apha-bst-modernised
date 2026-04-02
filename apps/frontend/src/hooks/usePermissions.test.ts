import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRole } from '@apha-bst/shared';
import type { AuthenticatedUser, DataEntryPermission } from '@apha-bst/shared';
import { useAuthStore } from '../stores/auth.store';
import { useIsReadOnly, useCanWrite } from './usePermissions';
import React from 'react';

vi.mock('../api/permissions');

import { fetchUserPermissions } from '../api/permissions';

const mockedFetchUserPermissions = vi.mocked(fetchUserPermissions);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const supervisorUser: AuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: UserRole.Supervisor,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'session-1',
};

const dataEntryUser: AuthenticatedUser = {
  userId: 2,
  userName: 'data.entry',
  userLevel: UserRole.DataEntry,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'session-2',
};

const readOnlyUser: AuthenticatedUser = {
  userId: 3,
  userName: 'read.only',
  userLevel: UserRole.ReadOnly,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'session-3',
};

describe('useIsReadOnly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns true for ReadOnly user', () => {
    useAuthStore.setState({
      token: 'token',
      user: readOnlyUser,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useIsReadOnly());
    expect(result.current).toBe(true);
  });

  it('returns false for Supervisor user', () => {
    useAuthStore.setState({
      token: 'token',
      user: supervisorUser,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useIsReadOnly());
    expect(result.current).toBe(false);
  });

  it('returns false for DataEntry user', () => {
    useAuthStore.setState({
      token: 'token',
      user: dataEntryUser,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useIsReadOnly());
    expect(result.current).toBe(false);
  });

  it('returns false when no user is logged in', () => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useIsReadOnly());
    expect(result.current).toBe(false);
  });
});

describe('useCanWrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns canWrite true for Supervisor without fetching permissions', () => {
    useAuthStore.setState({
      token: 'token',
      user: supervisorUser,
      isAuthenticated: true,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCanWrite('TrainingRecords'), {
      wrapper,
    });

    expect(result.current).toEqual({ canWrite: true, isLoading: false });
    expect(mockedFetchUserPermissions).not.toHaveBeenCalled();
  });

  it('returns canWrite false for ReadOnly without fetching permissions', () => {
    useAuthStore.setState({
      token: 'token',
      user: readOnlyUser,
      isAuthenticated: true,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCanWrite('TrainingRecords'), {
      wrapper,
    });

    expect(result.current).toEqual({ canWrite: false, isLoading: false });
    expect(mockedFetchUserPermissions).not.toHaveBeenCalled();
  });

  it('fetches permissions and returns canWrite true for DataEntry user with write access', async () => {
    useAuthStore.setState({
      token: 'token',
      user: dataEntryUser,
      isAuthenticated: true,
    });

    const permissions: DataEntryPermission[] = [
      { screenName: 'TrainingRecords', userId: 2, canWrite: true },
      { screenName: 'SiteManagement', userId: 2, canWrite: false },
    ];
    mockedFetchUserPermissions.mockResolvedValueOnce(permissions);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCanWrite('TrainingRecords'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({ canWrite: true, isLoading: false });
    expect(mockedFetchUserPermissions).toHaveBeenCalledWith(2);
  });

  it('fetches permissions and returns canWrite false for DataEntry user without write access', async () => {
    useAuthStore.setState({
      token: 'token',
      user: dataEntryUser,
      isAuthenticated: true,
    });

    const permissions: DataEntryPermission[] = [
      { screenName: 'TrainingRecords', userId: 2, canWrite: true },
      { screenName: 'SiteManagement', userId: 2, canWrite: false },
    ];
    mockedFetchUserPermissions.mockResolvedValueOnce(permissions);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCanWrite('SiteManagement'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({ canWrite: false, isLoading: false });
  });

  it('returns canWrite false for DataEntry user when screen not in permissions', async () => {
    useAuthStore.setState({
      token: 'token',
      user: dataEntryUser,
      isAuthenticated: true,
    });

    const permissions: DataEntryPermission[] = [
      { screenName: 'TrainingRecords', userId: 2, canWrite: true },
    ];
    mockedFetchUserPermissions.mockResolvedValueOnce(permissions);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCanWrite('UnknownScreen'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({ canWrite: false, isLoading: false });
  });
});
