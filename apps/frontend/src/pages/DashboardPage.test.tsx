import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { DashboardPage } from './DashboardPage';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders the system announcements section', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'System Announcements' })).toBeInTheDocument();
    expect(screen.getByText(/proof of concept/)).toBeInTheDocument();
  });

  it('renders the quick navigation section', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Quick Navigation' })).toBeInTheDocument();
  });

  it('renders quick action cards with correct links', () => {
    renderDashboard();

    const viewSitesLink = screen.getByRole('link', { name: /View Sites/ });
    expect(viewSitesLink).toHaveAttribute('href', '/sites');

    const registerSiteLink = screen.getByRole('link', { name: /Register Site/ });
    expect(registerSiteLink).toHaveAttribute('href', '/sites/register');

    const recordTrainingLink = screen.getByRole('link', { name: /Record Training/ });
    expect(recordTrainingLink).toHaveAttribute('href', '/training/add');

    const manageTrainersLink = screen.getByRole('link', { name: /Manage Trainers/ });
    expect(manageTrainersLink).toHaveAttribute('href', '/trainers');

    const addPersonLink = screen.getByRole('link', { name: /Add Person/ });
    expect(addPersonLink).toHaveAttribute('href', '/persons/add');
  });

  it('renders descriptions for each quick action', () => {
    renderDashboard();
    expect(screen.getByText('Browse and manage sampling sites')).toBeInTheDocument();
    expect(screen.getByText('Add a new sampling site')).toBeInTheDocument();
    expect(screen.getByText('Log a new training event')).toBeInTheDocument();
    expect(screen.getByText('View and manage trainers')).toBeInTheDocument();
    expect(screen.getByText('Register a new person')).toBeInTheDocument();
  });
});
