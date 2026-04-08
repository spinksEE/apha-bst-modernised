import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Suppress React's default error boundary console output during tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Normal content</div>;
}

function FallbackComponent({ errorRef, resetError }: { errorRef: string; resetError: () => void }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p data-testid="error-ref">{errorRef}</p>
      <button onClick={resetError}>Reset</button>
    </div>
  );
}

function renderWithBoundary(shouldThrow: boolean) {
  return render(
    <ErrorBoundary fallbackRender={(props) => <FallbackComponent {...props} />}>
      <ThrowingComponent shouldThrow={shouldThrow} />
    </ErrorBoundary>,
  );
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    renderWithBoundary(false);
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback with error reference when a child throws', () => {
    renderWithBoundary(true);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    const ref = screen.getByTestId('error-ref').textContent;
    expect(ref).toMatch(/^ERR-\d{8}-[A-F0-9]{6}$/);
  });

  it('calls console.error when an error is caught', () => {
    renderWithBoundary(true);
    expect(console.error).toHaveBeenCalled();
  });

  it('resets state when resetError is invoked', () => {
    // Use a mutable variable so the child reads the updated value
    // when ErrorBoundary re-renders after resetError clears hasError.
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) throw new Error('Test render error');
      return <div>Normal content</div>;
    }

    render(
      <ErrorBoundary fallbackRender={(props) => <FallbackComponent {...props} />}>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    // Error boundary caught the error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing, then click reset — boundary re-renders children successfully
    shouldThrow = false;
    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });
});
