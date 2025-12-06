import { describe, it, expect } from 'vitest';
import {
  isHeart,
  isQueenOfSpades,
  isPenaltyCard,
  followsSuit,
  hasSuit,
  hasOnlyHearts,
  hasOnlyPenaltyCards,
  isValidFirstTrickPlay,
  canLeadHearts,
  getValidPlays,
  isValidPlay,
  wouldBreakHearts
} from './moveValidation';
import { createCard } from '../models/Card';
import type { GameState } from '../models/GameState';

describe('moveValidation', () => {
  describe('isHeart', () => {
    it('should return true for Hearts', () => {
      const card = createCard('hearts', 'A');
      expect(isHeart(card)).toBe(true);
    });

    it('should return false for non-Hearts', () => {
      const card = createCard('spades', 'A');
      expect(isHeart(card)).toBe(false);
    });
  });

  describe('isQueenOfSpades', () => {
    it('should return true for Queen of Spades', () => {
      const card = createCard('spades', 'Q');
      expect(isQueenOfSpades(card)).toBe(true);
    });

    it('should return false for other cards', () => {
      expect(isQueenOfSpades(createCard('spades', 'K'))).toBe(false);
      expect(isQueenOfSpades(createCard('hearts', 'Q'))).toBe(false);
    });
  });

  describe('isPenaltyCard', () => {
    it('should return true for Hearts', () => {
      expect(isPenaltyCard(createCard('hearts', '2'))).toBe(true);
      expect(isPenaltyCard(createCard('hearts', 'A'))).toBe(true);
    });

    it('should return true for Queen of Spades', () => {
      expect(isPenaltyCard(createCard('spades', 'Q'))).toBe(true);
    });

    it('should return false for non-penalty cards', () => {
      expect(isPenaltyCard(createCard('spades', 'A'))).toBe(false);
      expect(isPenaltyCard(createCard('clubs', '2'))).toBe(false);
      expect(isPenaltyCard(createCard('diamonds', 'K'))).toBe(false);
    });
  });

  describe('followsSuit', () => {
    it('should return true when card matches led suit', () => {
      const card = createCard('hearts', '5');
      expect(followsSuit(card, 'hearts')).toBe(true);
    });

    it('should return false when card does not match led suit', () => {
      const card = createCard('hearts', '5');
      expect(followsSuit(card, 'spades')).toBe(false);
    });
  });

  describe('hasSuit', () => {
    it('should return true when hand contains suit', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('spades', '5'),
        createCard('clubs', 'K')
      ];
      expect(hasSuit(hand, 'hearts')).toBe(true);
      expect(hasSuit(hand, 'spades')).toBe(true);
    });

    it('should return false when hand does not contain suit', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('spades', '5')
      ];
      expect(hasSuit(hand, 'diamonds')).toBe(false);
    });
  });

  describe('hasOnlyHearts', () => {
    it('should return true when hand contains only Hearts', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', '5'),
        createCard('hearts', 'A')
      ];
      expect(hasOnlyHearts(hand)).toBe(true);
    });

    it('should return false when hand contains non-Hearts', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('spades', '5')
      ];
      expect(hasOnlyHearts(hand)).toBe(false);
    });

    it('should return false for empty hand', () => {
      expect(hasOnlyHearts([])).toBe(false);
    });
  });

  describe('hasOnlyPenaltyCards', () => {
    it('should return true when hand contains only penalty cards', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', 'A'),
        createCard('spades', 'Q')
      ];
      expect(hasOnlyPenaltyCards(hand)).toBe(true);
    });

    it('should return false when hand contains non-penalty cards', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('spades', 'A')
      ];
      expect(hasOnlyPenaltyCards(hand)).toBe(false);
    });
  });

  describe('isValidFirstTrickPlay', () => {
    it('should allow non-penalty cards on first trick', () => {
      const hand = [
        createCard('clubs', '2'),
        createCard('spades', 'A'),
        createCard('hearts', 'K')
      ];
      expect(isValidFirstTrickPlay(createCard('clubs', '2'), hand)).toBe(true);
      expect(isValidFirstTrickPlay(createCard('spades', 'A'), hand)).toBe(true);
    });

    it('should not allow penalty cards on first trick normally', () => {
      const hand = [
        createCard('clubs', '2'),
        createCard('hearts', 'K'),
        createCard('spades', 'Q')
      ];
      expect(isValidFirstTrickPlay(createCard('hearts', 'K'), hand)).toBe(false);
      expect(isValidFirstTrickPlay(createCard('spades', 'Q'), hand)).toBe(false);
    });

    it('should allow penalty cards if player has only penalty cards', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', 'K'),
        createCard('spades', 'Q')
      ];
      expect(isValidFirstTrickPlay(createCard('hearts', 'K'), hand)).toBe(true);
      expect(isValidFirstTrickPlay(createCard('spades', 'Q'), hand)).toBe(true);
    });
  });

  describe('canLeadHearts', () => {
    it('should allow leading Hearts when Hearts are broken', () => {
      const hand = [createCard('hearts', 'A')];
      expect(canLeadHearts(hand, true)).toBe(true);
    });

    it('should not allow leading Hearts when not broken', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('spades', 'K')
      ];
      expect(canLeadHearts(hand, false)).toBe(false);
    });

    it('should allow leading Hearts if player has only Hearts', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('hearts', '2')
      ];
      expect(canLeadHearts(hand, false)).toBe(true);
    });
  });

  describe('wouldBreakHearts', () => {
    it('should return true when playing Heart off-suit', () => {
      const gameState: GameState = {
        players: [],
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

      const card = createCard('hearts', '5');
      expect(wouldBreakHearts(card, gameState)).toBe(true);
    });

    it('should return false when leading Hearts', () => {
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

      const card = createCard('hearts', '5');
      expect(wouldBreakHearts(card, gameState)).toBe(false);
    });

    it('should return false when playing non-Heart', () => {
      const gameState: GameState = {
        players: [],
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

      const card = createCard('spades', '5');
      expect(wouldBreakHearts(card, gameState)).toBe(false);
    });
  });

  describe('getValidPlays and isValidPlay', () => {
    it('should require following suit when able', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', '5'),
        createCard('spades', 'A')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [[]], score: 0, totalScore: 0 }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [
          { card: createCard('hearts', 'K'), playerId: 'p1' }
        ],
        heartsBroken: true,
        selectedCardsForPassing: new Map()
      };

      const validPlays = getValidPlays(hand, gameState);
      expect(validPlays).toHaveLength(2);
      expect(validPlays.every(c => c.suit === 'hearts')).toBe(true);

      expect(isValidPlay(createCard('hearts', '2'), hand, gameState)).toBe(true);
      expect(isValidPlay(createCard('spades', 'A'), hand, gameState)).toBe(false);
    });

    it('should allow any card when unable to follow suit', () => {
      const hand = [
        createCard('diamonds', '2'),
        createCard('clubs', '5'),
        createCard('spades', 'A')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [[]], score: 0, totalScore: 0 }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [
          { card: createCard('hearts', 'K'), playerId: 'p1' }
        ],
        heartsBroken: true,
        selectedCardsForPassing: new Map()
      };

      const validPlays = getValidPlays(hand, gameState);
      expect(validPlays).toHaveLength(3);
    });

    it('should prevent leading Hearts when not broken', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('spades', 'A')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [[]], score: 0, totalScore: 0 }
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

      const validPlays = getValidPlays(hand, gameState);
      expect(validPlays).toHaveLength(1);
      expect(validPlays[0].suit).toBe('spades');

      expect(isValidPlay(createCard('hearts', '2'), hand, gameState)).toBe(false);
      expect(isValidPlay(createCard('spades', 'A'), hand, gameState)).toBe(true);
    });

    it('should allow leading Hearts if only Hearts in hand', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', 'A')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [[]], score: 0, totalScore: 0 }
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

      const validPlays = getValidPlays(hand, gameState);
      expect(validPlays).toHaveLength(2);
    });

    it('should prevent penalty cards on first trick', () => {
      const hand = [
        createCard('clubs', '2'),
        createCard('hearts', 'K'),
        createCard('spades', 'Q')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [], score: 0, totalScore: 0 }
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

      const validPlays = getValidPlays(hand, gameState);
      expect(validPlays).toHaveLength(1);
      expect(validPlays[0].suit).toBe('clubs');
    });

    it('should allow Q♠ on first trick when leading with only penalty cards', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', 'K'),
        createCard('spades', 'Q')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [], score: 0, totalScore: 0 }
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

      const validPlays = getValidPlays(hand, gameState);
      // When leading on first trick with only penalty cards:
      // - Can't lead Hearts (not broken)
      // - Can lead Q♠ (first trick exception allows it)
      expect(validPlays).toHaveLength(1);
      expect(validPlays[0].suit).toBe('spades');
      expect(validPlays[0].rank).toBe('Q');
    });

    it('should allow penalty cards on first trick if only penalty cards when following', () => {
      const hand = [
        createCard('hearts', '2'),
        createCard('hearts', 'K'),
        createCard('spades', 'Q')
      ];

      const gameState: GameState = {
        players: [
          { id: 'p1', name: 'P1', isHuman: true, hand: [], tricksTaken: [], score: 0, totalScore: 0 }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'playing',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [
          { card: createCard('diamonds', 'K'), playerId: 'p2' }
        ],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };

      const validPlays = getValidPlays(hand, gameState);
      // When following on first trick with only penalty cards and no cards of led suit,
      // all cards are valid (exception applies)
      expect(validPlays).toHaveLength(3);
    });
  });
});
