import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from './GameControls';

describe('GameControls', () => {
  it('should render New Game button', () => {
    const onNewGame = vi.fn();
    const onNewHand = vi.fn();

    render(
      <GameControls 
        phase="playing" 
        onNewGame={onNewGame} 
        onNewHand={onNewHand} 
      />
    );

    expect(screen.getByText('New Game')).toBeDefined();
  });

  it('should call onNewGame when New Game button is clicked', () => {
    const onNewGame = vi.fn();
    const onNewHand = vi.fn();

    render(
      <GameControls 
        phase="playing" 
        onNewGame={onNewGame} 
        onNewHand={onNewHand} 
      />
    );

    fireEvent.click(screen.getByText('New Game'));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('should show New Hand button during handComplete phase', () => {
    const onNewGame = vi.fn();
    const onNewHand = vi.fn();

    render(
      <GameControls 
        phase="handComplete" 
        onNewGame={onNewGame} 
        onNewHand={onNewHand} 
      />
    );

    expect(screen.getByText('New Hand')).toBeDefined();
  });

  it('should not show New Hand button during playing phase', () => {
    const onNewGame = vi.fn();
    const onNewHand = vi.fn();

    render(
      <GameControls 
        phase="playing" 
        onNewGame={onNewGame} 
        onNewHand={onNewHand} 
      />
    );

    expect(screen.queryByText('New Hand')).toBeNull();
  });

  it('should call onNewHand when New Hand button is clicked', () => {
    const onNewGame = vi.fn();
    const onNewHand = vi.fn();

    render(
      <GameControls 
        phase="handComplete" 
        onNewGame={onNewGame} 
        onNewHand={onNewHand} 
      />
    );

    fireEvent.click(screen.getByText('New Hand'));
    expect(onNewHand).toHaveBeenCalledTimes(1);
  });
});
