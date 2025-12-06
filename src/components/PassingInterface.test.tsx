import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassingInterface } from './PassingInterface';
import { createCard } from '../models';

describe('PassingInterface', () => {
  const mockCards = [
    createCard('clubs', '7'),
    createCard('diamonds', '10'),
    createCard('spades', 'Q'),
    createCard('hearts', 'K'),
    createCard('hearts', 'A'),
  ];

  it('should render with passing direction text', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
      />
    );

    expect(screen.getByText(/Pass 3 cards to the player on your LEFT/i)).toBeDefined();
  });

  it('should show selected count', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="right"
        onConfirmPassing={onConfirm}
      />
    );

    expect(screen.getByText(/Selected: 0 \/ 3 cards/i)).toBeDefined();
  });

  it('should allow selecting up to 3 cards', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="across"
        onConfirmPassing={onConfirm}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Select 3 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    expect(screen.getByText(/Selected: 3 \/ 3 cards/i)).toBeDefined();
  });

  it('should enable confirm button when 3 cards are selected', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirm Selection') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Select 3 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    expect(confirmButton.disabled).toBe(false);
  });

  it('should call onConfirmPassing with selected cards', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Select first 3 cards (clubs 7, diamonds 10, spades Q)
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    const confirmButton = screen.getByText('Confirm Selection');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ suit: 'clubs', rank: '7' }),
      expect.objectContaining({ suit: 'diamonds', rank: '10' }),
      expect.objectContaining({ suit: 'spades', rank: 'Q' }),
    ]);
  });

  it('should allow deselecting cards', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Select 2 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    expect(screen.getByText(/Selected: 2 \/ 3 cards/i)).toBeDefined();

    // Deselect first card
    fireEvent.click(cards[0]);
    expect(screen.getByText(/Selected: 1 \/ 3 cards/i)).toBeDefined();
  });

  it('should not allow selecting more than 3 cards', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Try to select 4 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);
    fireEvent.click(cards[3]);

    // Should still show only 3 selected
    expect(screen.getByText(/Selected: 3 \/ 3 cards/i)).toBeDefined();
  });

  it('should show message when passing direction is none', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="none"
        onConfirmPassing={onConfirm}
      />
    );

    expect(screen.getByText(/No passing this hand/i)).toBeDefined();
    expect(screen.queryByText('Confirm Selection')).toBeNull();
  });

  it('should be disabled when disabled prop is true', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
        disabled={true}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Try to select cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    // Should not select any cards
    expect(screen.getByText(/Selected: 0 \/ 3 cards/i)).toBeDefined();
  });
});
