import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  serializeGameState,
  deserializeGameState,
  saveGameState,
  loadGameState,
  clearSavedGameState,
  hasSavedGameState
} from './persistence';
import type { GameState } from '../models/GameState';
import type { Card } from '../models/Card';
import { createCard } from '../models/Card';

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

// Replace global localStorage with our mock
(globalThis as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

describe('Game State Persistence', () => {
  // Clean up localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('serializeGameState', () => {
    it('should serialize a basic game state to JSON string', () => {
      const gameState: GameState = {
        players: [
          {
            id: 'player1',
            name: 'Human',
            isHuman: true,
            hand: [createCard('hearts', '2')],
            tricksTaken: [],
            score: 0,
            totalScore: 0
          }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const json = serializeGameState(gameState);
      expect(json).toBeTruthy();
      expect(typeof json).toBe('string');
      
      // Should be valid JSON
      const parsed = JSON.parse(json);
      expect(parsed.players).toBeDefined();
      expect(parsed.phase).toBe('playing');
    });

    it('should serialize game state with cards in hand', () => {
      const gameState: GameState = {
        players: [
          {
            id: 'player1',
            name: 'Human',
            isHuman: true,
            hand: [
              createCard('hearts', 'A'),
              createCard('spades', 'Q'),
              createCard('clubs', '2')
            ],
            tricksTaken: [],
            score: 0,
            totalScore: 0
          }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const json = serializeGameState(gameState);
      const parsed = JSON.parse(json);
      
      expect(parsed.players[0].hand).toHaveLength(3);
      expect(parsed.players[0].hand[0].suit).toBe('hearts');
      expect(parsed.players[0].hand[0].rank).toBe('A');
    });

    it('should serialize game state with selectedCardsForPassing Map', () => {
      const selectedCards = new Map<string, Card[]>();
      selectedCards.set('player1', [createCard('hearts', 'K')]);
      
      const gameState: GameState = {
        players: [],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      const json = serializeGameState(gameState);
      const parsed = JSON.parse(json);
      
      expect(parsed.selectedCardsForPassing).toBeDefined();
      expect(parsed.selectedCardsForPassing.player1).toBeDefined();
      expect(parsed.selectedCardsForPassing.player1[0].rank).toBe('K');
    });
  });

  describe('deserializeGameState', () => {
    it('should deserialize a JSON string back to GameState', () => {
      const originalState: GameState = {
        players: [
          {
            id: 'player1',
            name: 'Human',
            isHuman: true,
            hand: [createCard('hearts', '2')],
            tricksTaken: [],
            score: 5,
            totalScore: 10
          }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'right',
        handNumber: 2,
        currentTrick: [],
        heartsBroken: true,
        selectedCardsForPassing: new Map()
      };

      const json = serializeGameState(originalState);
      const deserialized = deserializeGameState(json);

      expect(deserialized.players).toHaveLength(1);
      expect(deserialized.players[0].id).toBe('player1');
      expect(deserialized.players[0].score).toBe(5);
      expect(deserialized.phase).toBe('playing');
      expect(deserialized.passingDirection).toBe('right');
      expect(deserialized.handNumber).toBe(2);
      expect(deserialized.heartsBroken).toBe(true);
    });

    it('should restore Map from serialized object', () => {
      const selectedCards = new Map<string, Card[]>();
      selectedCards.set('player1', [createCard('hearts', 'K')]);
      selectedCards.set('player2', [createCard('spades', 'A')]);
      
      const originalState: GameState = {
        players: [],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      const json = serializeGameState(originalState);
      const deserialized = deserializeGameState(json);

      expect(deserialized.selectedCardsForPassing).toBeInstanceOf(Map);
      expect(deserialized.selectedCardsForPassing.size).toBe(2);
      expect(deserialized.selectedCardsForPassing.get('player1')).toBeDefined();
      expect(deserialized.selectedCardsForPassing.get('player2')).toBeDefined();
    });
  });

  describe('saveGameState and loadGameState', () => {
    it('should save and load game state from localStorage', () => {
      const gameState: GameState = {
        players: [
          {
            id: 'player1',
            name: 'Human',
            isHuman: true,
            hand: [createCard('hearts', 'A')],
            tricksTaken: [],
            score: 0,
            totalScore: 0
          }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      saveGameState(gameState);
      const loaded = loadGameState();

      expect(loaded).not.toBeNull();
      expect(loaded?.players[0].id).toBe('player1');
      expect(loaded?.phase).toBe('playing');
    });

    it('should return null when no saved state exists', () => {
      const loaded = loadGameState();
      expect(loaded).toBeNull();
    });

    it('should handle complex game state with multiple players', () => {
      const gameState: GameState = {
        players: [
          {
            id: 'player1',
            name: 'Human',
            isHuman: true,
            hand: [createCard('hearts', 'A'), createCard('spades', 'K')],
            tricksTaken: [[createCard('clubs', '2')]],
            score: 1,
            totalScore: 5
          },
          {
            id: 'player2',
            name: 'AI 1',
            isHuman: false,
            hand: [createCard('diamonds', 'Q')],
            tricksTaken: [],
            score: 0,
            totalScore: 3
          }
        ],
        currentPlayerIndex: 1,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'across',
        handNumber: 3,
        currentTrick: [
          { card: createCard('hearts', '5'), playerId: 'player1' }
        ],
        heartsBroken: true,
        selectedCardsForPassing: new Map()
      };

      saveGameState(gameState);
      const loaded = loadGameState();

      expect(loaded).not.toBeNull();
      expect(loaded?.players).toHaveLength(2);
      expect(loaded?.currentPlayerIndex).toBe(1);
      expect(loaded?.currentTrick).toHaveLength(1);
      expect(loaded?.currentTrick[0].playerId).toBe('player1');
    });
  });

  describe('clearSavedGameState', () => {
    it('should remove saved game state from localStorage', () => {
      const gameState: GameState = {
        players: [],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      saveGameState(gameState);
      expect(loadGameState()).not.toBeNull();

      clearSavedGameState();
      expect(loadGameState()).toBeNull();
    });
  });

  describe('hasSavedGameState', () => {
    it('should return false when no saved state exists', () => {
      expect(hasSavedGameState()).toBe(false);
    });

    it('should return true when saved state exists', () => {
      const gameState: GameState = {
        players: [],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      saveGameState(gameState);
      expect(hasSavedGameState()).toBe(true);
    });
  });
});
