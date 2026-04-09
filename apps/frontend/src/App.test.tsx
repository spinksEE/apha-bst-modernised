import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { HealthPage } from './pages/HealthPage';
// Mock API modules so HealthPage's useQuery doesn't make network requests
vi.mock('./api/health');

/**
 * Renders the app route tree with MemoryRouter for testable navigation.
 * Uses real DashboardPage and NotFoundPage (no async deps), stubs for
 * data-fetching pages since individual page tests cover their rendering.
 */
function renderApp(initialEntries: string[] = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/health" element={<HealthPage />} />
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/sites/register" element={<div>Register Site Page</div>} />
              <Route path="/sites/:plantNo/edit" element={<div>Edit Site Page</div>} />
              <Route path="/sites" element={<div>Sites Page</div>} />
              <Route path="/persons/add" element={<div>Add Person Page</div>} />
              <Route path="/persons/:id/edit" element={<div>Edit Person Page</div>} />
              <Route path="/trainers" element={<div>Trainers Page</div>} />
              <Route path="/training/add" element={<div>Record Training Page</div>} />
              <Route path="/training/:id/edit" element={<div>Edit Training Page</div>} />
              <Route path="/persons/:id/training" element={<div>Training History Page</div>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('App routing integration', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('route resolution', () => {
    it('renders DashboardPage at root route "/"', () => {
      renderApp(['/']);
      expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
      expect(screen.getByText('System Announcements')).toBeInTheDocument();
      expect(screen.getByText('Quick Navigation')).toBeInTheDocument();
    });

    it('renders NotFoundPage for unknown routes', () => {
      renderApp(['/this-route-does-not-exist']);
      expect(screen.getByRole('heading', { name: 'Page not found', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Return to Home Dashboard' })).toHaveAttribute('href', '/');
    });

    it('renders HealthPage at "/health" without layout shell', () => {
      renderApp(['/health']);
      // HealthPage renders a loading state (mocked API returns undefined)
      expect(screen.getByTestId('health-loading')).toBeInTheDocument();
      // No layout shell elements should be present
      expect(screen.queryByText('APHA BST')).not.toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
    });

    it('routes "/sites" to Sites page within layout', () => {
      renderApp(['/sites']);
      expect(screen.getByText('Sites Page')).toBeInTheDocument();
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
    });

    it('routes "/sites/register" to Register Site page within layout', () => {
      renderApp(['/sites/register']);
      expect(screen.getByText('Register Site Page')).toBeInTheDocument();
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
    });

    it('routes "/persons/add" to Add Person page within layout', () => {
      renderApp(['/persons/add']);
      expect(screen.getByText('Add Person Page')).toBeInTheDocument();
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
    });

    it('routes "/trainers" to Trainers page within layout', () => {
      renderApp(['/trainers']);
      expect(screen.getByText('Trainers Page')).toBeInTheDocument();
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
    });

    it('routes "/training/add" to Record Training page within layout', () => {
      renderApp(['/training/add']);
      expect(screen.getByText('Record Training Page')).toBeInTheDocument();
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
    });

    it('routes "/persons/:id/training" to Training History page within layout', () => {
      renderApp(['/persons/42/training']);
      expect(screen.getByText('Training History Page')).toBeInTheDocument();
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
    });
  });

  describe('application shell persistence (US-071, US-072)', () => {
    it('displays header with APHA BST branding and user context', () => {
      renderApp(['/']);
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
      expect(screen.getByText('Hello, Smith, J (Supv)')).toBeInTheDocument();
    });

    it('displays navigation bar with Home link', () => {
      renderApp(['/']);
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    });

    it('displays Brainstem and Sites dropdown triggers', () => {
      renderApp(['/']);
      expect(screen.getByText(/Brainstem ▾/)).toBeInTheDocument();
      expect(screen.getByText(/Sites ▾/)).toBeInTheDocument();
    });

    it('displays footer with copyright', () => {
      renderApp(['/']);
      expect(screen.getByText('APHA BST System v2.0 POC | Crown Copyright 2026')).toBeInTheDocument();
    });

    it('displays ALPHA phase banner', () => {
      renderApp(['/']);
      expect(screen.getByText('ALPHA')).toBeInTheDocument();
    });

    it('preserves shell chrome on NotFoundPage', () => {
      renderApp(['/nonexistent-route']);
      // NotFoundPage content
      expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
      // Shell chrome still present
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
      expect(screen.getByText('Hello, Smith, J (Supv)')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      expect(screen.getByText('APHA BST System v2.0 POC | Crown Copyright 2026')).toBeInTheDocument();
    });

    it('preserves shell chrome on feature routes', () => {
      renderApp(['/trainers']);
      expect(screen.getByText('Trainers Page')).toBeInTheDocument();
      // Shell chrome
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
      expect(screen.getByText('Hello, Smith, J (Supv)')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      expect(screen.getByText('APHA BST System v2.0 POC | Crown Copyright 2026')).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary integration (US-073)', () => {
    function ThrowingPage(): React.JSX.Element {
      throw new Error('Simulated render error');
    }

    function renderAppWithThrowingRoute() {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return render(
        <QueryClientProvider client={queryClient}>
          <MantineProvider>
            <MemoryRouter initialEntries={['/explode']}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="/explode" element={<ThrowingPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </MantineProvider>
        </QueryClientProvider>,
      );
    }

    it('renders ErrorPage when a route component throws', () => {
      renderAppWithThrowingRoute();
      expect(screen.getByRole('heading', { name: 'An Error Occurred', level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/Sorry, there was a problem with the application/)).toBeInTheDocument();
    });

    it('displays error reference in ERR-YYYYMMDD-XXXXXX format', () => {
      renderAppWithThrowingRoute();
      const refElement = screen.getByTestId('error-reference');
      expect(refElement.textContent).toMatch(/^ERR-\d{8}-[A-F0-9]{6}$/);
    });

    it('displays guidance to quote error reference', () => {
      renderAppWithThrowingRoute();
      expect(screen.getByText(/Please quote this reference if you report the problem/)).toBeInTheDocument();
    });

    it('provides Return to Home Dashboard link', () => {
      renderAppWithThrowingRoute();
      const homeLink = screen.getByRole('link', { name: 'Return to Home Dashboard' });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('preserves shell chrome when error occurs', () => {
      renderAppWithThrowingRoute();
      // Error page content
      expect(screen.getByRole('heading', { name: 'An Error Occurred' })).toBeInTheDocument();
      // Shell chrome still present — header, nav, footer survive the error
      expect(screen.getByText('APHA BST')).toBeInTheDocument();
      expect(screen.getByText('Hello, Smith, J (Supv)')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      expect(screen.getByText('APHA BST System v2.0 POC | Crown Copyright 2026')).toBeInTheDocument();
    });

    it('does not expose stack traces or sensitive error details (BR-072)', () => {
      renderAppWithThrowingRoute();
      expect(screen.queryByText('Simulated render error')).not.toBeInTheDocument();
      expect(screen.queryByText(/at ThrowingPage/)).not.toBeInTheDocument();
    });
  });
});
