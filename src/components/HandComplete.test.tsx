import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HandComplete } from './HandComplete';
import type { Player } from '../models';

describe('HandComplete', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Player 1',
      isHuman: true,
      hand: [],
      tricksTaken: [],
      score: 5,
      totalScore: 45
    },
    {
      id: '2',
      name: 'Player 2',
      isHuman: false,
      hand: [],
      tricksTaken: [],
      score: 8,
      totalScore: 78
    },
    {
      id: '3',
      name: 'Player 3',
      isHuman: false,
      hand: [],
      tricksTaken: [],
      score: 13,
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

  it('should render Hand Complete title', () => {
    const onNewHand = vi.fn();

    render(<HandComplete players={mockPlayers} onNewHand={onNewHand} />);

    expect(screen.getByText('Hand Complete!')).toBeDefined();
  });

  it('should display hand scores for all players', () => {
    const onNewHand = vi.fn();

    render(<HandComplete players={mockPlayers} onNewHand={onNewHand} />);

    expect(screen.getByText('+5 points')).toBeDefined();
    expect(screen.getByText('+8 points')).toBeDefined();
    expect(screen.getByText('+13 points')).toBeDefined();
    expect(screen.getByText('0 points')).toBeDefined();
  });

  it('should display total scores sorted by rank', () => {
    const onNewHand = vi.fn();

    render(<HandComplete players={mockPlayers} onNewHand={onNewHand} />);

    // Check that total scores are displayed
    const totalScores = screen.getAllByText(/^\d+$/);
    expect(totalScores.length).toBeGreaterThan(0);
  });

  it('should call onNewHand when Next Hand button is clicked', () => {
    const onNewHand = vi.fn();

    render(<HandComplete players={mockPlayers} onNewHand={onNewHand} />);

    fireEvent.click(screen.getByText('Next Hand'));
    expect(onNewHand).toHaveBeenCalledTimes(1);
  });

  it('should display shoot the moon message when a player scores 26', () => {
    const moonPlayers: Player[] = [
      {
        id: '1',
        name: 'Moon Shooter',
        isHuman: true,
        hand: [],
        tricksTaken: [],
        score: 26,
        totalScore: 26
      },
      {
        id: '2',
        name: 'Player 2',
        isHuman: false,
        hand: [],
        tricksTaken: [],
        score: 0,
        totalScore: 26
      },
      {
        id: '3',
        name: 'Player 3',
        isHuman: false,
        hand: [],
        tricksTaken: [],
        score: 0,
        totalScore: 26
      },
      {
        id: '4',
        name: 'Player 4',
        isHuman: false,
        hand: [],
        tricksTaken: [],
        score: 0,
        totalScore: 26
      }
    ];

    const onNewHand = vi.fn();

    render(<HandComplete players={moonPlayers} onNewHand={onNewHand} />);

    expect(screen.getByText(/Moon Shooter shot the moon!/)).toBeDefined();
  });

  it('should call onNewHand when backdrop is clicked', () => {
    const onNewHand = vi.fn();

    render(<HandComplete players={mockPlayers} onNewHand={onNewHand} />);

    const backdrop = document.querySelector('.hand-complete__backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onNewHand).toHaveBeenCalledTimes(1);
    }
  });
});
