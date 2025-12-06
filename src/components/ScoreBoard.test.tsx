import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from './ScoreBoard';
import type { Player } from '../models';

describe('ScoreBoard Component', () => {
  const mockPlayers: Player[] = [
    {
      id: 'player0',
      name: 'Alice',
      isHuman: true,
      hand: [],
      tricksTaken: [],
      score: 5,
      totalScore: 23,
    },
    {
      id: 'player1',
      name: 'Bob',
      isHuman: false,
      hand: [],
      tricksTaken: [],
      score: 8,
      totalScore: 31,
    },
  ];

  it('should render all player names', () => {
    render(<ScoreBoard players={mockPlayers} currentPlayerIndex={0} />);
    
    expect(screen.getByText(/Alice/)).toBeDefined();
    expect(screen.getByText(/Bob/)).toBeDefined();
  });

  it('should display hand and total scores', () => {
    render(<ScoreBoard players={mockPlayers} currentPlayerIndex={0} />);
    
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('23')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('31')).toBeDefined();
  });

  it('should mark human player with (You)', () => {
    render(<ScoreBoard players={mockPlayers} currentPlayerIndex={0} />);
    
    expect(screen.getByText(/\(You\)/)).toBeDefined();
  });

  it('should highlight the active player', () => {
    const { container } = render(<ScoreBoard players={mockPlayers} currentPlayerIndex={0} />);
    
    const activePlayer = container.querySelector('.scoreboard__player--active');
    expect(activePlayer).toBeDefined();
  });
});
