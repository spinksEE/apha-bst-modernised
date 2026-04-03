import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthPage } from './HealthPage';
import type { HealthResponse } from '../types/health';
import { renderWithProviders } from '../test-utils';

vi.mock('../api/health');

import { fetchHealth } from '../api/health';

const mockedFetchHealth = vi.mocked(fetchHealth);

const renderHealthPage = () => renderWithProviders(<HealthPage />);

describe('HealthPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders healthy response as JSON', async () => {
    const healthy: HealthResponse = {
      status: 'ok',
      database: 'connected',
      uptime: 42,
    };
    mockedFetchHealth.mockResolvedValue(healthy);

    renderHealthPage();

    await waitFor(() => {
      expect(screen.getByTestId('health-response')).toBeInTheDocument();
    });

    const content = JSON.parse(
      screen.getByTestId('health-response').textContent!,
    );
    expect(content.status).toBe('ok');
    expect(content.database).toBe('connected');
    expect(content.uptime).toBe(42);
  });

  it('renders unhealthy response as JSON', async () => {
    const unhealthy: HealthResponse = {
      status: 'error',
      database: 'disconnected',
      uptime: 10,
    };
    mockedFetchHealth.mockResolvedValue(unhealthy);

    renderHealthPage();

    await waitFor(() => {
      expect(screen.getByTestId('health-response')).toBeInTheDocument();
    });

    const content = JSON.parse(
      screen.getByTestId('health-response').textContent!,
    );
    expect(content.status).toBe('error');
    expect(content.database).toBe('disconnected');
  });

  it('renders error state when backend is unreachable', async () => {
    mockedFetchHealth.mockRejectedValue(new Error('Network Error'));

    renderHealthPage();

    await waitFor(() => {
      expect(screen.getByTestId('health-response')).toBeInTheDocument();
    });

    const content = JSON.parse(
      screen.getByTestId('health-response').textContent!,
    );
    expect(content.status).toBe('error');
    expect(content.database).toBe('unknown');
    expect(content.uptime).toBe(0);
  });
});
