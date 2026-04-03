import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { HomePage } from './HomePage';
import { useAuthStore } from '../store/auth';
import { renderWithProviders } from '../test-utils';
import type { UserContext } from '../types/auth';

const renderHomePage = () => renderWithProviders(<HomePage />);

const baseContext: UserContext = {
  userId: 'user-1',
  name: 'John Smith',
  role: 'Supervisor',
  locationId: 'loc-1',
  locationName: 'Preston Laboratory',
};

describe('HomePage', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: 'token', userContext: baseContext, referenceId: null });
  });

  it('shows full navigation for supervisor', () => {
    renderHomePage();

    expect(screen.getByRole('heading', { name: /bst system - home/i })).toBeInTheDocument();
    expect(screen.getByText(/training records/i)).toBeInTheDocument();
    expect(screen.getByText(/site management/i)).toBeInTheDocument();
    expect(screen.getByText(/personnel management/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /navigation/i })).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getAllByText(/welcome: john smith/i)).toHaveLength(2);
  });

  it('hides supervisor-only navigation for data entry role', () => {
    useAuthStore.setState({
      accessToken: 'token',
      userContext: { ...baseContext, role: 'DataEntry' },
      referenceId: null,
    });

    renderHomePage();

    expect(screen.queryByText(/user management/i)).not.toBeInTheDocument();
    expect(screen.getByText(/training records/i)).toBeInTheDocument();
  });

  it('shows read-only notice for read-only role', () => {
    useAuthStore.setState({
      accessToken: 'token',
      userContext: { ...baseContext, role: 'ReadOnly' },
      referenceId: null,
    });

    renderHomePage();

    expect(screen.getByRole('note')).toHaveTextContent('read-only');
  });
});
