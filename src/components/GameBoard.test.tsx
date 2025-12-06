import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameBoard } from './GameBoard';

// Mock the useGame hook
vi.mock('../hooks/useGame', () => ({
  useGame: () => ({
    gameState: null,
    error: null,
    isProcessingAI: false,
    startNewGame: vi.fn(),
    startNewHand: vi.fn(),
    playCard: vi.fn(),
    loadSavedGame: vi.fn(() => false)
  })
}));

describe('GameBoard', () => {
  it('renders loading state when game state is null', () => {
    render(<GameBoard />);
    expect(screen.getByText(/loading game/i)).toBeDefined();
  });
});
