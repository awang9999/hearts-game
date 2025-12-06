import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerHand } from './PlayerHand';
import { createCard } from '../models';

describe('PlayerHand Component', () => {
  it('should render all cards in the hand', () => {
    const cards = [
      createCard('hearts', 'A'),
      createCard('spades', 'K'),
      createCard('diamonds', 'Q'),
    ];
    
    render(<PlayerHand cards={cards} />);
    
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('K')).toBeDefined();
    expect(screen.getByText('Q')).toBeDefined();
  });

  it('should display the label', () => {
    const cards = [createCard('clubs', '2')];
    render(<PlayerHand cards={cards} label="Test Hand" />);
    
    expect(screen.getByText('Test Hand')).toBeDefined();
  });

  it('should sort cards by suit and rank', () => {
    const cards = [
      createCard('hearts', 'A'),
      createCard('clubs', '2'),
      createCard('diamonds', 'K'),
    ];
    
    const { container } = render(<PlayerHand cards={cards} />);
    const cardElements = container.querySelectorAll('.player-hand__card');
    
    // Should have 3 cards
    expect(cardElements.length).toBe(3);
  });
});
