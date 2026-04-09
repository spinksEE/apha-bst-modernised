import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ErrorPage } from './ErrorPage';

const mockErrorRef = 'ERR-20260408-A1B2C3';

function renderErrorPage(resetError = vi.fn()) {
  return {
    resetError,
    ...render(
      <MemoryRouter>
        <ErrorPage errorRef={mockErrorRef} resetError={resetError} />
      </MemoryRouter>,
    ),
  };
}

describe('ErrorPage', () => {
  it('renders the error heading', () => {
    renderErrorPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'An Error Occurred' }),
    ).toBeInTheDocument();
  });

  it('displays the error reference', () => {
    renderErrorPage();
    expect(screen.getByTestId('error-reference')).toHaveTextContent(mockErrorRef);
  });

  it('does not display any stack trace or sensitive information', () => {
    renderErrorPage();
    const bodyText = document.body.textContent;
    expect(bodyText).not.toMatch(/stack/i);
    expect(bodyText).not.toMatch(/exception/i);
    expect(bodyText).not.toMatch(/connection/i);
  });

  it('renders guidance text for reporting', () => {
    renderErrorPage();
    expect(screen.getByText(/quote this reference/)).toBeInTheDocument();
  });

  it('renders a link back to the home dashboard', () => {
    renderErrorPage();
    const link = screen.getByRole('link', { name: 'Return to Home Dashboard' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('calls resetError when the return link is clicked', () => {
    const { resetError } = renderErrorPage();
    fireEvent.click(screen.getByRole('link', { name: 'Return to Home Dashboard' }));
    expect(resetError).toHaveBeenCalledOnce();
  });
});
