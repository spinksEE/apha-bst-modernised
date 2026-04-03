import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AccessDeniedPage } from './AccessDeniedPage';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '../store/auth';
import { renderWithProviders } from '../test-utils';

const renderAccessDeniedRoutes = (route = '/access-denied') =>
  renderWithProviders(
    <Routes>
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>,
    { route },
  );

describe('AccessDeniedPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: 'token', userContext: null, referenceId: 'UA-REF-1' });
  });

  it('renders the access denied message with reference id', () => {
    renderAccessDeniedRoutes();

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
    expect(screen.getByText(/reference id/i)).toHaveTextContent('UA-REF-1');
  });

  it('returns to login when user clicks return', async () => {
    renderAccessDeniedRoutes();

    await userEvent.click(screen.getByRole('button', { name: /return/i }));

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });
});
