import { describe, it, expect } from 'vitest';
import {
  createPlayer,
  getCurrentPlayer,
  getCurrentPhase,
  isPlayerTurn,
  getTricksPlayed,
  isFirstTrick,
  getLedSuit,
  getPassingDirection
} from './GameState';
import type { GameState } from './GameState';
import { createCard } from './Card';

describe('GameState Helper Functions', () => {
  describe('createPlayer', () => {
    it('should create a human player', () => {
      const player = createPlayer('p1', 'Alice', true);
      
      expect(player.id).toBe('p1');
      expect(player.name).toBe('Alice');
      expect(player.isHuman).toBe(true);
      expect(player.hand).toEqual([]);
      expect(player.tricksTaken).toEqual([]);
      expect(player.score).toBe(0);
      expect(player.totalScore).toBe(0);
    });

    it('should create an AI player', () => {
      const player = createPlayer('p2', 'AI Bot', false);
      
      expect(player.id).toBe('p2');
      expect(player.name).toBe('AI Bot');
      expect(player.isHuman).toBe(false);
    });
  });

  describe('getCurrentPlayer', () => {
    it('should return the current player', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 2,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const currentPlayer = getCurrentPlayer(gameState);
      expect(currentPlayer.id).toBe('p3');
    });
  });

  describe('getCurrentPhase', () => {
    it('should return the current phase', () => {
      const players = [createPlayer('p1', 'Player 1', true)];
      
      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(getCurrentPhase(gameState)).toBe('passing');
    });
  });

  describe('isPlayerTurn', () => {
    it('should return true for the current player', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false)
      ];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 1,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(isPlayerTurn(gameState, 'p2')).toBe(true);
      expect(isPlayerTurn(gameState, 'p1')).toBe(false);
    });
  });

  describe('getTricksPlayed', () => {
    it('should return 0 when no tricks have been played', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false)
      ];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(getTricksPlayed(gameState)).toBe(0);
    });

    it('should return the number of completed tricks', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false)
      ];

      players[0].tricksTaken = [
        [createCard('hearts', '2')],
        [createCard('hearts', '3')]
      ];
      players[1].tricksTaken = [
        [createCard('diamonds', '2')],
        [createCard('diamonds', '3')]
      ];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(getTricksPlayed(gameState)).toBe(2);
    });
  });

  describe('isFirstTrick', () => {
    it('should return true when no tricks have been played', () => {
      const players = [createPlayer('p1', 'Player 1', true)];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(isFirstTrick(gameState)).toBe(true);
    });

    it('should return false when tricks have been played', () => {
      const players = [createPlayer('p1', 'Player 1', true)];
      players[0].tricksTaken = [[createCard('hearts', '2')]];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(isFirstTrick(gameState)).toBe(false);
    });

    it('should return true when current trick has cards but no tricks completed', () => {
      const players = [createPlayer('p1', 'Player 1', true)];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [
          { card: createCard('clubs', '2'), playerId: 'p1' }
        ],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(isFirstTrick(gameState)).toBe(true);
    });
  });

  describe('getLedSuit', () => {
    it('should return null when no cards have been played', () => {
      const players = [createPlayer('p1', 'Player 1', true)];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(getLedSuit(gameState)).toBeNull();
    });

    it('should return the suit of the first card played', () => {
      const players = [createPlayer('p1', 'Player 1', true)];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [
          { card: createCard('hearts', '5'), playerId: 'p1' },
          { card: createCard('hearts', '7'), playerId: 'p2' }
        ],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      expect(getLedSuit(gameState)).toBe('hearts');
    });
  });

  describe('getPassingDirection', () => {
    it('should return left for hand 1', () => {
      expect(getPassingDirection(1)).toBe('left');
    });

    it('should return right for hand 2', () => {
      expect(getPassingDirection(2)).toBe('right');
    });

    it('should return across for hand 3', () => {
      expect(getPassingDirection(3)).toBe('across');
    });

    it('should return none for hand 4', () => {
      expect(getPassingDirection(4)).toBe('none');
    });

    it('should cycle back to left for hand 5', () => {
      expect(getPassingDirection(5)).toBe('left');
    });

    it('should cycle correctly for hand 8', () => {
      expect(getPassingDirection(8)).toBe('none');
    });
  });
});
