import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useGame', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllTimers();
  });

  it('should initialize with null game state', () => {
    const { result } = renderHook(() => useGame());
    
    expect(result.current.gameState).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessingAI).toBe(false);
  });

  it('should start a new game', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    expect(result.current.gameState).not.toBeNull();
    expect(result.current.gameState?.players).toHaveLength(4);
    expect(result.current.gameState?.players[0].isHuman).toBe(true);
    expect(result.current.gameState?.players[1].isHuman).toBe(false);
    expect(result.current.gameState?.players[2].isHuman).toBe(false);
    expect(result.current.gameState?.players[3].isHuman).toBe(false);
  });

  it('should initialize game in passing phase', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    expect(result.current.gameState?.phase).toBe('passing');
    expect(result.current.gameState?.handNumber).toBe(1);
  });

  it('should deal 13 cards to each player', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    result.current.gameState?.players.forEach(player => {
      expect(player.hand).toHaveLength(13);
    });
  });

  it('should handle invalid card selection for passing', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    const humanPlayer = result.current.gameState?.players[0];
    expect(humanPlayer).toBeDefined();
    
    // Try to select only 2 cards (should fail)
    act(() => {
      result.current.selectPassingCards(
        humanPlayer!.id,
        humanPlayer!.hand.slice(0, 2)
      );
    });
    
    expect(result.current.error).not.toBeNull();
  });

  it('should allow valid card selection for passing', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    const humanPlayer = result.current.gameState?.players[0];
    expect(humanPlayer).toBeDefined();
    
    // Select exactly 3 cards
    act(() => {
      result.current.selectPassingCards(
        humanPlayer!.id,
        humanPlayer!.hand.slice(0, 3)
      );
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.gameState?.selectedCardsForPassing.has(humanPlayer!.id)).toBe(true);
  });

  it('should save game state to localStorage', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    const savedState = localStorageMock.getItem('hearts-game-state');
    expect(savedState).not.toBeNull();
  });

  it('should load saved game from localStorage', () => {
    const { result: result1 } = renderHook(() => useGame());
    
    // Start a game and let it save
    act(() => {
      result1.current.startNewGame();
    });
    
    const handNumber = result1.current.gameState?.handNumber;
    
    // Create a new hook instance and load the saved game
    const { result: result2 } = renderHook(() => useGame());
    
    act(() => {
      result2.current.loadSavedGame();
    });
    
    expect(result2.current.gameState).not.toBeNull();
    expect(result2.current.gameState?.handNumber).toBe(handNumber);
  });

  it('should prevent playing card when not player turn', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    // Force game to playing phase for testing
    if (result.current.gameState) {
      act(() => {
        result.current.gameState!.phase = 'playing';
      });
    }
    
    const humanPlayer = result.current.gameState?.players[0];
    const currentPlayer = result.current.gameState?.players[result.current.gameState.currentPlayerIndex];
    
    // If it's not the human player's turn
    if (humanPlayer && currentPlayer && humanPlayer.id !== currentPlayer.id) {
      act(() => {
        result.current.playCard(humanPlayer.id, humanPlayer.hand[0]);
      });
      
      expect(result.current.error).not.toBeNull();
    }
  });

  it('should start a new hand after completing a hand', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    const initialHandNumber = result.current.gameState?.handNumber;
    
    act(() => {
      result.current.startNewHand();
    });
    
    expect(result.current.gameState?.handNumber).toBe((initialHandNumber || 0) + 1);
    expect(result.current.gameState?.phase).toBe('passing');
  });

  it('should clear saved game', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startNewGame();
    });
    
    expect(localStorageMock.getItem('hearts-game-state')).not.toBeNull();
    
    act(() => {
      result.current.clearSavedGame();
    });
    
    expect(localStorageMock.getItem('hearts-game-state')).toBeNull();
  });
});
