import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { LoginPage } from '../pages/LoginPage';
import { useAuthStore } from '../store/auth';
import { renderWithProviders } from '../test-utils';

vi.mock('../hooks/useSessionBootstrap', () => ({
  useSessionBootstrap: () => ({ isLoading: false }),
}));

const renderRequireAuth = (route = '/') =>
  renderWithProviders(
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <div>Protected Content</div>
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
    </Routes>,
    { route },
  );

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('redirects unauthenticated users to login', () => {
    useAuthStore.setState({ accessToken: null, userContext: null, referenceId: null });

    renderRequireAuth();

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('redirects to access denied when reference id is present', () => {
    useAuthStore.setState({ accessToken: 'token', userContext: null, referenceId: 'UA-123' });

    renderRequireAuth();

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
  });

  it('renders protected content when session is valid', () => {
    useAuthStore.setState({
      accessToken: 'token',
      userContext: {
        userId: 'user-1',
        name: 'Jane Doe',
        role: 'Supervisor',
        locationId: 'loc-1',
        locationName: 'Preston Laboratory',
      },
      referenceId: null,
    });

    renderRequireAuth();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
