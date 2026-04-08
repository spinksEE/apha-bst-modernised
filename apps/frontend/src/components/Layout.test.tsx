import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

function renderLayout() {
  return render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>,
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

  it('renders navigation links for Register Site and View Sites', () => {
    renderLayout();

    const registerLink = screen.getByText('Register Site');
    expect(registerLink.closest('a')).toHaveAttribute('href', '/sites/register');

    const viewLink = screen.getByText('View Sites');
    expect(viewLink.closest('a')).toHaveAttribute('href', '/sites');
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

  it('renders the footer', () => {
    renderLayout();

    expect(screen.getByText('APHA Brainstem Training Schedule')).toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    renderLayout();

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
