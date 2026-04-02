import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppShell } from './AppShell';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@apha-bst/shared';
import type { AuthenticatedUser } from '@apha-bst/shared';
import { theme } from '../../theme/theme';

vi.mock('../../api/auth', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

import { logout as logoutApi } from '../../api/auth';

const supervisorUser: AuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: UserRole.Supervisor,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'sess-1',
};

function renderAppShell(user: AuthenticatedUser = supervisorUser) {
  useAuthStore.setState({
    token: 'test-token',
    user,
    isAuthenticated: true,
  });

  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route
              index
              element={<div data-testid="child-content">Home Content</div>}
            />
          </Route>
          <Route
            path="/login"
            element={<div data-testid="login-page">Login</div>}
          />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('displays user name, role, and location in header', () => {
    renderAppShell();

    const header = screen.getByTestId('app-header');
    expect(header).toHaveTextContent('BST System');
    expect(header).toHaveTextContent('admin.supervisor');
    expect(header).toHaveTextContent('Supervisor');
    expect(header).toHaveTextContent('Preston Laboratory');
  });

  it('displays user context in footer', () => {
    renderAppShell();

    const footer = screen.getByTestId('app-footer');
    expect(footer).toHaveTextContent('APHA BST System 2026');
    expect(footer).toHaveTextContent('admin.supervisor');
    expect(footer).toHaveTextContent('Supervisor');
    expect(footer).toHaveTextContent('Preston Laboratory');
  });

  it('renders child route content via Outlet', () => {
    renderAppShell();

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent(
      'Home Content',
    );
  });

  it('has a disabled Help button', () => {
    renderAppShell();

    const helpButton = screen.getByRole('button', { name: /help/i });
    expect(helpButton).toBeDisabled();
  });

  it('logout clears session and redirects to /login', async () => {
    const user = userEvent.setup();
    renderAppShell();

    await user.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(logoutApi).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('displays Data Entry user context correctly', () => {
    const dataEntryUser: AuthenticatedUser = {
      userId: 2,
      userName: 'data.entry',
      userLevel: UserRole.DataEntry,
      userLocation: 2,
      locationName: 'Weybridge',
      sessionId: 'sess-2',
    };

    renderAppShell(dataEntryUser);

    const header = screen.getByTestId('app-header');
    expect(header).toHaveTextContent('data.entry');
    expect(header).toHaveTextContent('DataEntry');
    expect(header).toHaveTextContent('Weybridge');
  });
});
