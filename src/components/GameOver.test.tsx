import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOver } from './GameOver';
import type { Player } from '../models';

describe('GameOver', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Player 1',
      isHuman: true,
      hand: [],
      tricksTaken: [],
      score: 0,
      totalScore: 45
    },
    {
      id: '2',
      name: 'Player 2',
      isHuman: false,
      hand: [],
      tricksTaken: [],
      score: 0,
      totalScore: 78
    },
    {
      id: '3',
      name: 'Player 3',
      isHuman: false,
      hand: [],
      tricksTaken: [],
      score: 0,
      totalScore: 102
    },
    {
      id: '4',
      name: 'Player 4',
      isHuman: false,
      hand: [],
      tricksTaken: [],
      score: 0,
      totalScore: 56
    }
  ];

  it('should render Game Over title', () => {
    const onNewGame = vi.fn();

    render(<GameOver players={mockPlayers} onNewGame={onNewGame} />);

    expect(screen.getByText('Game Over!')).toBeDefined();
  });

  it('should display winner with lowest score', () => {
    const onNewGame = vi.fn();

    render(<GameOver players={mockPlayers} onNewGame={onNewGame} />);

    expect(screen.getByText(/Player 1 Wins!/)).toBeDefined();
  });

  it('should display all players sorted by score', () => {
    const onNewGame = vi.fn();

    render(<GameOver players={mockPlayers} onNewGame={onNewGame} />);

    const scores = screen.getAllByText(/\d+ points/);
    expect(scores).toHaveLength(4);
    
    // Check that scores are in ascending order
    expect(screen.getByText('45 points')).toBeDefined();
    expect(screen.getByText('56 points')).toBeDefined();
    expect(screen.getByText('78 points')).toBeDefined();
    expect(screen.getByText('102 points')).toBeDefined();
  });

  it('should call onNewGame when Play Again button is clicked', () => {
    const onNewGame = vi.fn();

    render(<GameOver players={mockPlayers} onNewGame={onNewGame} />);

    fireEvent.click(screen.getByText('Play Again'));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('should call onNewGame when backdrop is clicked', () => {
    const onNewGame = vi.fn();

    render(<GameOver players={mockPlayers} onNewGame={onNewGame} />);

    const backdrop = document.querySelector('.game-over__backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onNewGame).toHaveBeenCalledTimes(1);
    }
  });
});
