import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from './AppShell';
import { renderWithProviders } from '../test-utils';
import type { UserContext } from '../types/auth';

const userContext: UserContext = {
  userId: 'user-1',
  name: 'John Smith',
  role: 'Supervisor',
  locationId: 'loc-1',
  locationName: 'Preston Laboratory',
};

describe('AppShell', () => {
  it('renders the header, navigation, and footer', () => {
    renderWithProviders(
      <AppShell userContext={userContext} navigation={<div>Navigation</div>}>
        <div>Shell Content</div>
      </AppShell>,
    );

    expect(screen.getByLabelText(/bst system header/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome: john smith/i)).toBeInTheDocument();
    expect(screen.getByText(/navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/shell content/i)).toBeInTheDocument();
    expect(screen.getByText(/apha bst system/i)).toBeInTheDocument();
  });
});
