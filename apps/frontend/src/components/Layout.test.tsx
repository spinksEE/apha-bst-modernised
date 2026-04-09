import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

function renderLayout() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('Layout', () => {
  it('renders the skip link', () => {
    renderLayout();

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders the APHA BST header with home link', () => {
    renderLayout();

    const homeLink = screen.getByText('APHA BST');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders "Hello, Smith, J (Supv)" in header', () => {
    renderLayout();

    expect(screen.getByText('Hello, Smith, J (Supv)')).toBeInTheDocument();
  });

  it('renders "Home" link to /', () => {
    renderLayout();

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders "Brainstem" and "Sites" dropdown triggers', () => {
    renderLayout();

    expect(screen.getByText(/Brainstem/)).toBeInTheDocument();
    expect(screen.getByText(/Sites/)).toBeInTheDocument();
  });

  it('clicking "Brainstem" reveals "Add Training" and "Manage Trainers"', async () => {
    renderLayout();

    fireEvent.click(screen.getByText(/Brainstem/));

    await waitFor(() => {
      expect(screen.getByText('Add Training')).toBeInTheDocument();
      expect(screen.getByText('Manage Trainers')).toBeInTheDocument();
    });
  });

  it('clicking "Sites" reveals "View All Sites", "Add New Site", and "Add Person"', async () => {
    renderLayout();

    fireEvent.click(screen.getByText(/Sites/));

    await waitFor(() => {
      expect(screen.getByText('View All Sites')).toBeInTheDocument();
      expect(screen.getByText('Add New Site')).toBeInTheDocument();
      expect(screen.getByText('Add Person')).toBeInTheDocument();
    });
  });

  it('renders the ALPHA phase banner', () => {
    renderLayout();

    expect(screen.getByText('ALPHA')).toBeInTheDocument();
    expect(screen.getByText(/This is a new service/)).toBeInTheDocument();
  });

  it('renders main content area with correct id', () => {
    renderLayout();

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('renders the footer with correct text', () => {
    renderLayout();

    expect(screen.getByText('APHA BST System v2.0 POC | Crown Copyright 2026')).toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    renderLayout();

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
