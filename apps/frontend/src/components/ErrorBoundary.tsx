import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { generateErrorReference } from '../utils/errorReference';
import { logError } from '../utils/errorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackRender: (props: { errorRef: string; resetError: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorRef: string | null;
}

/**
 * React error boundary that catches render errors, generates a unique
 * error reference, logs the error, and renders a fallback UI.
 *
 * Class component required — React has no hook equivalent for error boundaries.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorRef: null };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    const errorRef = generateErrorReference();
    return { hasError: true, errorRef };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(this.state.errorRef ?? 'UNKNOWN', error);
    if (info.componentStack) {
      console.error('Component stack:', info.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, errorRef: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.errorRef) {
      return this.props.fallbackRender({
        errorRef: this.state.errorRef,
        resetError: this.resetError,
      });
    }
    return this.props.children;
  }
}
