import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppShell as MantineAppShell,
  Group,
  Text,
  Button,
} from '@mantine/core';
import { useAuthStore } from '../../stores/auth.store';
import { logout } from '../../api/auth';

export function AppShell(): React.JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Even if API call fails, clear local auth state
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  const userRoleLabel = user?.userLevel ?? '';
  const userDisplayName = user?.userName ?? '';
  const userLocationName = user?.locationName ?? '';

  return (
    <MantineAppShell
      header={{ height: 60 }}
      footer={{ height: 50 }}
      padding="md"
    >
      <MantineAppShell.Header data-testid="app-header">
        <Group h="100%" px="md" justify="space-between">
          <Text fw={700} size="lg">
            BST System
          </Text>

          <Group gap="md" data-testid="user-context">
            <Text size="sm">
              Welcome: {userDisplayName} ({userRoleLabel}) - {userLocationName}
            </Text>

            <Button
              variant="subtle"
              size="sm"
              disabled
              aria-label="Help"
            >
              Help
            </Button>

            <Button
              variant="light"
              size="sm"
              data-testid="logout-button"
              loading={loggingOut}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>

      <MantineAppShell.Footer data-testid="app-footer" p="xs">
        <Group justify="space-between" px="md">
          <Text size="xs" c="dimmed">
            APHA BST System 2026
          </Text>
          <Text size="xs" c="dimmed">
            User: {userDisplayName} | Role: {userRoleLabel} | Location: {userLocationName}
          </Text>
        </Group>
      </MantineAppShell.Footer>
    </MantineAppShell>
  );
}
