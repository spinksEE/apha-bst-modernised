import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '../stores/auth.store';
import { theme } from '../theme/theme';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../api/auth', () => ({
  login: vi.fn(),
}));

import { login as loginApi } from '../api/auth';

function renderLoginPage() {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('renders form fields and submit button', () => {
    renderLoginPage();

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
    expect(screen.getByText('Brainstem Training System')).toBeInTheDocument();
    expect(screen.getByText('APHA BST System © 2026')).toBeInTheDocument();
  });

  it('shows error on failed login (401)', async () => {
    const user = userEvent.setup();
    const axiosError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    });
    vi.mocked(loginApi).mockRejectedValueOnce(axiosError);

    renderLoginPage();

    await user.type(screen.getByTestId('username-input'), 'admin.supervisor');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');
    await user.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('login-error')).toHaveTextContent(
      'Invalid username or password',
    );
  });

  it('redirects to home on successful login', async () => {
    const user = userEvent.setup();
    vi.mocked(loginApi).mockResolvedValueOnce({
      accessToken: 'jwt-token',
      user: {
        userId: 1,
        userName: 'admin.supervisor',
        userLevel: 'Supervisor' as never,
        userLocation: 1,
        locationName: 'Preston Laboratory',
      },
    });

    renderLoginPage();

    await user.type(screen.getByTestId('username-input'), 'admin.supervisor');
    await user.type(screen.getByTestId('password-input'), 'admin');
    await user.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('jwt-token');
  });

  it('redirects to /access-denied on 403', async () => {
    const user = userEvent.setup();
    const axiosError = Object.assign(new Error('Forbidden'), {
      isAxiosError: true,
      response: { status: 403 },
    });
    vi.mocked(loginApi).mockRejectedValueOnce(axiosError);

    renderLoginPage();

    await user.type(screen.getByTestId('username-input'), 'unknown.user');
    await user.type(screen.getByTestId('password-input'), 'admin');
    await user.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/access-denied');
    });
  });
});
