import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { HomePage } from './HomePage';
import { useAuthStore } from '../store/auth';
import type { LoginResponse } from '../types/auth';
import { renderWithProviders } from '../test-utils';

vi.mock('../api/auth');

import { login } from '../api/auth';

const mockedLogin = vi.mocked(login);

const renderLoginRoutes = (route = '/login') =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
    </Routes>,
    { route },
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useAuthStore.setState({ accessToken: null, userContext: null, referenceId: null });
    window.localStorage.clear();
  });

  it('submits credentials and redirects to home on success', async () => {
    const response: LoginResponse = {
      accessToken: 'token-123',
      userContext: {
        userId: 'user-1',
        name: 'John Smith',
        role: 'Supervisor',
        locationId: 'loc-1',
        locationName: 'Preston Laboratory',
      },
    };
    mockedLogin.mockResolvedValue(response);

    renderLoginRoutes();

    await userEvent.type(screen.getByLabelText(/username/i), 'john');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bst system - home/i })).toBeInTheDocument();
    });

    expect(mockedLogin).toHaveBeenCalledWith({ username: 'john', password: 'secret' });
  });

  it('shows an error message on failed login', async () => {
    mockedLogin.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

    renderLoginRoutes();

    await userEvent.type(screen.getByLabelText(/username/i), 'bad');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
