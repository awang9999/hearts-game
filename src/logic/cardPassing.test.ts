import { describe, it, expect } from 'vitest';
import {
  validatePassingSelection,
  validateCardsInHand,
  getPassingTargetIndex,
  executeCardPassing,
  selectCardsForPassing,
  allPlayersHaveSelected
} from './cardPassing';
import { createCard } from '../models/Card';
import type { GameState } from '../models/GameState';
import { createPlayer } from '../models/GameState';

describe('Card Passing Logic', () => {
  describe('validatePassingSelection', () => {
    it('should return true for exactly 3 cards', () => {
      const cards = [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4')
      ];
      expect(validatePassingSelection(cards)).toBe(true);
    });

    it('should return false for less than 3 cards', () => {
      const cards = [
        createCard('hearts', '2'),
        createCard('hearts', '3')
      ];
      expect(validatePassingSelection(cards)).toBe(false);
    });

    it('should return false for more than 3 cards', () => {
      const cards = [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4'),
        createCard('hearts', '5')
      ];
      expect(validatePassingSelection(cards)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(validatePassingSelection([])).toBe(false);
    });
  });

  describe('validateCardsInHand', () => {
    it('should return true when all selected cards are in hand', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4'),
        createCard('spades', 'K')
      ];
      const selected = [
        createCard('hearts', '2'),
        createCard('hearts', '4')
      ];
      expect(validateCardsInHand(selected, hand)).toBe(true);
    });

    it('should return false when some cards are not in hand', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', '3')
      ];
      const selected = [
        createCard('hearts', '2'),
        createCard('spades', 'K')
      ];
      expect(validateCardsInHand(selected, hand)).toBe(false);
    });

    it('should return true for empty selection', () => {
      const hand = [createCard('hearts', '2')];
      expect(validateCardsInHand([], hand)).toBe(true);
    });
  });

  describe('getPassingTargetIndex', () => {
    it('should return next player for left passing', () => {
      expect(getPassingTargetIndex(0, 'left', 4)).toBe(1);
      expect(getPassingTargetIndex(1, 'left', 4)).toBe(2);
      expect(getPassingTargetIndex(2, 'left', 4)).toBe(3);
      expect(getPassingTargetIndex(3, 'left', 4)).toBe(0); // Wraps around
    });

    it('should return previous player for right passing', () => {
      expect(getPassingTargetIndex(0, 'right', 4)).toBe(3); // Wraps around
      expect(getPassingTargetIndex(1, 'right', 4)).toBe(0);
      expect(getPassingTargetIndex(2, 'right', 4)).toBe(1);
      expect(getPassingTargetIndex(3, 'right', 4)).toBe(2);
    });

    it('should return opposite player for across passing', () => {
      expect(getPassingTargetIndex(0, 'across', 4)).toBe(2);
      expect(getPassingTargetIndex(1, 'across', 4)).toBe(3);
      expect(getPassingTargetIndex(2, 'across', 4)).toBe(0);
      expect(getPassingTargetIndex(3, 'across', 4)).toBe(1);
    });

    it('should return same player for no passing', () => {
      expect(getPassingTargetIndex(0, 'none', 4)).toBe(0);
      expect(getPassingTargetIndex(1, 'none', 4)).toBe(1);
      expect(getPassingTargetIndex(2, 'none', 4)).toBe(2);
      expect(getPassingTargetIndex(3, 'none', 4)).toBe(3);
    });
  });

  describe('selectCardsForPassing', () => {
    it('should update selected cards for a player', () => {
      const player = createPlayer('p1', 'Player 1', true);
      player.hand = [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4'),
        createCard('spades', 'K')
      ];

      const gameState: GameState = {
        players: [player],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const cardsToPass = [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4')
      ];

      const result = selectCardsForPassing(gameState, 'p1', cardsToPass);

      expect(result.selectedCardsForPassing.has('p1')).toBe(true);
      expect(result.selectedCardsForPassing.get('p1')).toHaveLength(3);
    });

    it('should throw error if not exactly 3 cards selected', () => {
      const player = createPlayer('p1', 'Player 1', true);
      player.hand = [createCard('hearts', '2'), createCard('hearts', '3')];

      const gameState: GameState = {
        players: [player],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const cardsToPass = [createCard('hearts', '2')];

      expect(() => selectCardsForPassing(gameState, 'p1', cardsToPass))
        .toThrow('Must select exactly 3 cards for passing');
    });

    it('should throw error if cards not in hand', () => {
      const player = createPlayer('p1', 'Player 1', true);
      player.hand = [createCard('hearts', '2')];

      const gameState: GameState = {
        players: [player],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const cardsToPass = [
        createCard('spades', 'K'),
        createCard('spades', 'Q'),
        createCard('spades', 'J')
      ];

      expect(() => selectCardsForPassing(gameState, 'p1', cardsToPass))
        .toThrow('Selected cards are not in player hand');
    });
  });

  describe('executeCardPassing', () => {
    it('should exchange cards between players when passing left', () => {
      const players = [
        createPlayer('p0', 'Player 0', true),
        createPlayer('p1', 'Player 1', false),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false)
      ];

      // Set up hands
      players[0].hand = [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4'),
        createCard('spades', 'K')
      ];
      players[1].hand = [
        createCard('diamonds', '2'),
        createCard('diamonds', '3'),
        createCard('diamonds', '4'),
        createCard('clubs', 'K')
      ];
      players[2].hand = [
        createCard('spades', '2'),
        createCard('spades', '3'),
        createCard('spades', '4'),
        createCard('hearts', 'K')
      ];
      players[3].hand = [
        createCard('clubs', '2'),
        createCard('clubs', '3'),
        createCard('clubs', '4'),
        createCard('diamonds', 'K')
      ];

      const selectedCards = new Map();
      selectedCards.set('p0', [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4')
      ]);
      selectedCards.set('p1', [
        createCard('diamonds', '2'),
        createCard('diamonds', '3'),
        createCard('diamonds', '4')
      ]);
      selectedCards.set('p2', [
        createCard('spades', '2'),
        createCard('spades', '3'),
        createCard('spades', '4')
      ]);
      selectedCards.set('p3', [
        createCard('clubs', '2'),
        createCard('clubs', '3'),
        createCard('clubs', '4')
      ]);

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      const result = executeCardPassing(gameState);

      // Each player should still have 4 cards (removed 3, received 3, had 1 remaining)
      expect(result.players[0].hand).toHaveLength(4);
      expect(result.players[1].hand).toHaveLength(4);
      expect(result.players[2].hand).toHaveLength(4);
      expect(result.players[3].hand).toHaveLength(4);

      // Player 0 should have received cards from player 3
      const p0HasClubs2 = result.players[0].hand.some(c => c.suit === 'clubs' && c.rank === '2');
      expect(p0HasClubs2).toBe(true);

      // Phase should transition to playing
      expect(result.phase).toBe('playing');

      // Selected cards should be cleared
      expect(result.selectedCardsForPassing.size).toBe(0);
    });

    it('should transition to playing phase when passing direction is none', () => {
      const players = [createPlayer('p0', 'Player 0', true)];
      players[0].hand = [createCard('hearts', '2')];

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'none',
        handNumber: 4,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const result = executeCardPassing(gameState);

      expect(result.phase).toBe('playing');
      expect(result.players[0].hand).toHaveLength(1);
    });

    it('should throw error if not all players have selected cards', () => {
      const players = [
        createPlayer('p0', 'Player 0', true),
        createPlayer('p1', 'Player 1', false)
      ];

      const selectedCards = new Map();
      selectedCards.set('p0', [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4')
      ]);
      // p1 hasn't selected

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      expect(() => executeCardPassing(gameState))
        .toThrow('Not all players have selected cards for passing');
    });
  });

  describe('allPlayersHaveSelected', () => {
    it('should return true when all players have selected 3 cards', () => {
      const players = [
        createPlayer('p0', 'Player 0', true),
        createPlayer('p1', 'Player 1', false)
      ];

      const selectedCards = new Map();
      selectedCards.set('p0', [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4')
      ]);
      selectedCards.set('p1', [
        createCard('diamonds', '2'),
        createCard('diamonds', '3'),
        createCard('diamonds', '4')
      ]);

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      expect(allPlayersHaveSelected(gameState)).toBe(true);
    });

    it('should return false when some players have not selected', () => {
      const players = [
        createPlayer('p0', 'Player 0', true),
        createPlayer('p1', 'Player 1', false)
      ];

      const selectedCards = new Map();
      selectedCards.set('p0', [
        createCard('hearts', '2'),
        createCard('hearts', '3'),
        createCard('hearts', '4')
      ]);

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      expect(allPlayersHaveSelected(gameState)).toBe(false);
    });

    it('should return false when a player has selected wrong number of cards', () => {
      const players = [createPlayer('p0', 'Player 0', true)];

      const selectedCards = new Map();
      selectedCards.set('p0', [
        createCard('hearts', '2'),
        createCard('hearts', '3')
      ]); // Only 2 cards

      const gameState: GameState = {
        players,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'passing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: selectedCards
      };

      expect(allPlayersHaveSelected(gameState)).toBe(false);
    });
  });
});
