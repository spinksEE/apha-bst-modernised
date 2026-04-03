import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/auth';
import type { AuthErrorResponse, LoginRequest } from '../types/auth';
import { useMemo, useState } from 'react';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setReferenceId = useAuthStore((state) => state.setReferenceId);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userContext = useAuthStore((state) => state.userContext);

  const redirectPath = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname ?? '/';
  }, [location.state]);

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      setSession(data.accessToken, data.userContext);
      setReferenceId(null);
      setErrorMessage(null);
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      clearSession();
      const errorResponse = (error as { response?: { data?: AuthErrorResponse } })
        .response?.data;
      setErrorMessage(errorResponse?.message ?? 'Unable to login.');
    },
  });

  if (accessToken && userContext) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setErrorMessage(null);
    mutation.mutate({ username, password });
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>BST System</header>
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <form
          onSubmit={handleSubmit}
          aria-label="Login form"
          style={{
            width: '100%',
            maxWidth: '420px',
            border: '1px solid #cfd8e3',
            borderRadius: '8px',
            padding: '2rem',
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h1 style={{ marginBottom: '1.5rem' }}>Log In</h1>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid #94a3b8',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1.25rem' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid #94a3b8',
              }}
            />
          </label>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: 'none',
              background: '#005ea5',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {mutation.isPending ? 'Signing in...' : 'Log In'}
          </button>
          {errorMessage ? (
            <p role="alert" style={{ marginTop: '1rem', color: '#b91c1c' }}>
              {errorMessage}
            </p>
          ) : null}
        </form>
      </section>
      <footer style={{ padding: '1rem 2rem', fontSize: '0.9rem', color: '#475569' }}>
        APHA BST System © 2026
      </footer>
    </main>
  );
}
