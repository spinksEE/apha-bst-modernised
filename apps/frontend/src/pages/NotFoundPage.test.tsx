import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

function renderNotFound() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe('NotFoundPage', () => {
  it('renders the page not found heading', () => {
    renderNotFound();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('renders helpful guidance text', () => {
    renderNotFound();
    expect(screen.getByText(/check it is correct/)).toBeInTheDocument();
    expect(screen.getByText(/check you copied the entire address/)).toBeInTheDocument();
  });

  it('renders a link back to the home dashboard', () => {
    renderNotFound();
    const link = screen.getByRole('link', { name: 'Return to Home Dashboard' });
    expect(link).toHaveAttribute('href', '/');
  });
});
