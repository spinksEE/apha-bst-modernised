import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@apha-bst/shared';
import type { AuthenticatedUser } from '@apha-bst/shared';

const supervisorUser: AuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: UserRole.Supervisor,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'sess-1',
};

const readOnlyUser: AuthenticatedUser = {
  userId: 3,
  userName: 'read.only',
  userLevel: UserRole.ReadOnly,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'sess-3',
};

function renderWithRouter(
  ui: React.ReactElement,
  initialRoute = '/',
) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route
          path="/access-denied"
          element={<div data-testid="access-denied-page">Access Denied</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('redirects to /login when unauthenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to /access-denied when role is not allowed', () => {
    useAuthStore.setState({
      token: 'token',
      user: readOnlyUser,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.Supervisor]}>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('access-denied-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with correct role', () => {
    useAuthStore.setState({
      token: 'token',
      user: supervisorUser,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.Supervisor]}>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children when authenticated with no role restriction', () => {
    useAuthStore.setState({
      token: 'token',
      user: supervisorUser,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
