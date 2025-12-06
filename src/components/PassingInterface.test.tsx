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

  it('should render with cards', () => {
    const onConfirm = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
      />
    );

    expect(screen.getByText('Confirm Selection')).toBeDefined();
  });

  it('should call onSelectionChange when cards are selected', () => {
    const onConfirm = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="right"
        onConfirmPassing={onConfirm}
        onSelectionChange={onSelectionChange}
      />
    );

    // Should be called with 0 initially
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it('should allow selecting up to 3 cards', () => {
    const onConfirm = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="across"
        onConfirmPassing={onConfirm}
        onSelectionChange={onSelectionChange}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Select 3 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    expect(onSelectionChange).toHaveBeenCalledWith(3);
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
    const onSelectionChange = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
        onSelectionChange={onSelectionChange}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Select 2 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    expect(onSelectionChange).toHaveBeenCalledWith(2);

    // Deselect first card
    fireEvent.click(cards[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(1);
  });

  it('should not allow selecting more than 3 cards', () => {
    const onConfirm = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
        onSelectionChange={onSelectionChange}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Try to select 4 cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);
    fireEvent.click(cards[3]);

    // Should still show only 3 selected
    expect(onSelectionChange).toHaveBeenCalledWith(3);
    expect(onSelectionChange).not.toHaveBeenCalledWith(4);
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
    const onSelectionChange = vi.fn();
    render(
      <PassingInterface
        cards={mockCards}
        passingDirection="left"
        onConfirmPassing={onConfirm}
        onSelectionChange={onSelectionChange}
        disabled={true}
      />
    );

    const cards = screen.getAllByRole('button', { name: /of/i });
    
    // Clear previous calls
    onSelectionChange.mockClear();
    
    // Try to select cards
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    // Should not select any cards (no new calls)
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
