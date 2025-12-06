import { describe, it, expect } from 'vitest';
import { selectAICardToPlay, evaluateCardSafety } from './aiPlaying';
import { createCard } from '../models/Card';
import type { GameState } from '../models/GameState';

describe('AI Playing Strategy', () => {
  // Helper to create a minimal game state for testing
  const createTestGameState = (overrides?: Partial<GameState>): GameState => {
    return {
      players: [
        {
          id: 'player1',
          name: 'Player 1',
          isHuman: false,
          hand: [],
          tricksTaken: [],
          score: 0,
          totalScore: 0
        },
        {
          id: 'player2',
          name: 'Player 2',
          isHuman: false,
          hand: [],
          tricksTaken: [],
          score: 0,
          totalScore: 0
        },
        {
          id: 'player3',
          name: 'Player 3',
          isHuman: false,
          hand: [],
          tricksTaken: [],
          score: 0,
          totalScore: 0
        },
        {
          id: 'player4',
          name: 'Player 4',
          isHuman: false,
          hand: [],
          tricksTaken: [],
          score: 0,
          totalScore: 0
        }
      ],
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'none',
      handNumber: 1,
      currentTrick: [],
      heartsBroken: false,
      selectedCardsForPassing: new Map(),
      ...overrides
    };
  };

  describe('evaluateCardSafety', () => {
    it('should rate Queen of Spades as very dangerous', () => {
      const queenOfSpades = createCard('spades', 'Q');
      const hand = [queenOfSpades, createCard('clubs', '2')];
      const gameState = createTestGameState();

      const safety = evaluateCardSafety(queenOfSpades, hand, gameState);
      expect(safety).toBeGreaterThan(40); // Should be very high
    });

    it('should rate Hearts as dangerous', () => {
      const aceOfHearts = createCard('hearts', 'A');
      const hand = [aceOfHearts, createCard('clubs', '2')];
      const gameState = createTestGameState();

      const safety = evaluateCardSafety(aceOfHearts, hand, gameState);
      expect(safety).toBeGreaterThan(20); // Should be dangerous
    });

    it('should rate low non-penalty cards as safer', () => {
      const twoOfClubs = createCard('clubs', '2');
      const hand = [twoOfClubs, createCard('clubs', '3')];
      const gameState = createTestGameState();

      const safety = evaluateCardSafety(twoOfClubs, hand, gameState);
      expect(safety).toBeLessThan(10); // Should be relatively safe
    });
  });

  describe('selectAICardToPlay', () => {
    it('should select a valid card when leading', () => {
      const hand = [
        createCard('clubs', '2'),
        createCard('clubs', '3'),
        createCard('hearts', 'A')
      ];
      const gameState = createTestGameState();

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(hand).toContainEqual(selectedCard);
    });

    it('should select the only valid card when there is one', () => {
      const twoOfClubs = createCard('clubs', '2');
      const hand = [twoOfClubs];
      const gameState = createTestGameState();

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(selectedCard).toEqual(twoOfClubs);
    });

    it('should follow suit when required', () => {
      const hand = [
        createCard('clubs', '5'),
        createCard('clubs', '7'),
        createCard('hearts', 'A'),
        createCard('spades', 'K')
      ];
      const gameState = createTestGameState({
        currentTrick: [
          { card: createCard('clubs', '2'), playerId: 'player2' }
        ]
      });

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(selectedCard.suit).toBe('clubs');
    });

    it('should slough when unable to follow suit', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('spades', 'Q')
      ];
      const gameState = createTestGameState({
        currentTrick: [
          { card: createCard('clubs', '2'), playerId: 'player2' }
        ],
        heartsBroken: true
      });

      const selectedCard = selectAICardToPlay(hand, gameState);
      // Should select one of the cards (any is valid when sloughing)
      expect(hand).toContainEqual(selectedCard);
    });

    it('should not lead Hearts when Hearts are not broken and has other cards', () => {
      const hand = [
        createCard('clubs', '5'),
        createCard('hearts', 'A')
      ];
      const gameState = createTestGameState({
        heartsBroken: false
      });

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(selectedCard.suit).not.toBe('hearts');
    });

    it('should lead Hearts when Hearts are broken', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('hearts', 'K')
      ];
      const gameState = createTestGameState({
        heartsBroken: true
      });

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(selectedCard.suit).toBe('hearts');
    });

    it('should lead Hearts when only Hearts remain', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('hearts', 'Q')
      ];
      const gameState = createTestGameState({
        heartsBroken: false
      });

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(selectedCard.suit).toBe('hearts');
    });

    it('should not play penalty cards on first trick unless only option', () => {
      const hand = [
        createCard('clubs', '5'),
        createCard('hearts', 'A')
      ];
      const gameState = createTestGameState({
        currentTrick: [
          { card: createCard('clubs', '2'), playerId: 'player2' }
        ]
      });

      const selectedCard = selectAICardToPlay(hand, gameState);
      expect(selectedCard.suit).toBe('clubs');
    });
  });
});
