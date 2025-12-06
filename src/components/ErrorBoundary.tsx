import { Component, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * ErrorBoundary component - Catches and handles React errors
 * Requirements: 11.1
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack || null
    });
  }

  handleReset = (): void => {
    // Clear any saved game state that might be corrupted
    try {
      localStorage.removeItem('hearts-game-state');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page to start fresh
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <h1 className="error-boundary__title">Oops! Something went wrong</h1>
            <p className="error-boundary__message">
              The game encountered an unexpected error. This might be due to corrupted game state.
            </p>
            
            {this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__summary">Error Details</summary>
                <pre className="error-boundary__error-text">
                  {this.state.error.toString()}
                  {this.state.errorInfo && `\n\n${this.state.errorInfo}`}
                </pre>
              </details>
            )}

            <button 
              className="error-boundary__reset-button"
              onClick={this.handleReset}
            >
              Reset Game and Try Again
            </button>

            <p className="error-boundary__help-text">
              Clicking "Reset Game" will clear your saved game and start fresh.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
