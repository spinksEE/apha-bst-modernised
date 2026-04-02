import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { HomePage } from './HomePage';
import { useAuthStore } from '../stores/auth.store';
import { theme } from '../theme/theme';
import { UserRole } from '@apha-bst/shared';

function renderHomePage() {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </MantineProvider>,
  );
}

const supervisorUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: UserRole.Supervisor,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'test-session',
};

const dataEntryUser = {
  userId: 2,
  userName: 'data.entry',
  userLevel: UserRole.DataEntry,
  userLocation: 2,
  locationName: 'Weybridge',
  sessionId: 'test-session',
};

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders welcome banner with user context and navigation cards', () => {
    useAuthStore.setState({
      token: 'test-token',
      user: supervisorUser,
      isAuthenticated: true,
    });

    renderHomePage();

    expect(screen.getByTestId('welcome-banner')).toHaveTextContent(
      'Welcome, admin.supervisor',
    );
    expect(screen.getByTestId('welcome-banner')).toHaveTextContent(
      'Supervisor',
    );
    expect(screen.getByTestId('welcome-banner')).toHaveTextContent(
      'Preston Laboratory',
    );
    expect(screen.getByTestId('nav-grid')).toBeInTheDocument();
    expect(screen.getByTestId('nav-training')).toBeInTheDocument();
    expect(screen.getByTestId('nav-sites')).toBeInTheDocument();
    expect(screen.getByTestId('nav-personnel')).toBeInTheDocument();
    expect(screen.getByTestId('nav-reports')).toBeInTheDocument();
    expect(screen.getByTestId('announcements-panel')).toHaveTextContent(
      'No current system announcements',
    );
  });

  it('shows User Management card for Supervisor users', () => {
    useAuthStore.setState({
      token: 'test-token',
      user: supervisorUser,
      isAuthenticated: true,
    });

    renderHomePage();

    expect(screen.getByTestId('nav-user-management')).toBeInTheDocument();
    expect(screen.getByTestId('nav-user-management')).toHaveTextContent(
      'User Management',
    );
  });

  it('hides User Management card for non-Supervisor users', () => {
    useAuthStore.setState({
      token: 'test-token',
      user: dataEntryUser,
      isAuthenticated: true,
    });

    renderHomePage();

    expect(screen.getByTestId('nav-training')).toBeInTheDocument();
    expect(screen.getByTestId('nav-sites')).toBeInTheDocument();
    expect(screen.getByTestId('nav-personnel')).toBeInTheDocument();
    expect(screen.getByTestId('nav-reports')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-user-management')).not.toBeInTheDocument();
  });
});
