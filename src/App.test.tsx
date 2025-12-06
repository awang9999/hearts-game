import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the GameBoard component
vi.mock('./components', () => ({
  GameBoard: () => <div data-testid="game-board">Game Board</div>,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app container', () => {
    render(<App />);
    const appElement = document.querySelector('.app');
    expect(appElement).toBeTruthy();
  });

  it('wraps GameBoard in ErrorBoundary', () => {
    render(<App />);
    const errorBoundary = screen.getByTestId('error-boundary');
    const gameBoard = screen.getByTestId('game-board');
    
    expect(errorBoundary).toBeTruthy();
    expect(gameBoard).toBeTruthy();
    expect(errorBoundary.contains(gameBoard)).toBe(true);
  });

  it('renders GameBoard component', () => {
    render(<App />);
    expect(screen.getByTestId('game-board')).toBeTruthy();
  });
});
