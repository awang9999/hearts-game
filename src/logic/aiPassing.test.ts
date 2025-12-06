import { describe, it, expect } from 'vitest';
import { evaluateCardDanger, selectAICardsToPass } from './aiPassing';
import { createCard } from '../models/Card';

describe('AI Passing Strategy', () => {
  describe('evaluateCardDanger', () => {
    it('should rate Queen of Spades as most dangerous', () => {
      const queenOfSpades = createCard('spades', 'Q');
      const hand = [queenOfSpades, createCard('hearts', 'A'), createCard('clubs', '2')];
      
      const danger = evaluateCardDanger(queenOfSpades, hand);
      
      expect(danger).toBe(100); // Highest danger score
    });

    it('should rate high Hearts as dangerous', () => {
      const aceOfHearts = createCard('hearts', 'A');
      const hand = [aceOfHearts, createCard('clubs', '2'), createCard('diamonds', '3')];
      
      const danger = evaluateCardDanger(aceOfHearts, hand);
      
      // A♥ has value 14, so danger = 14 * 3 + 14 = 56
      expect(danger).toBeGreaterThan(40);
    });

    it('should rate low cards as less dangerous', () => {
      const twoOfClubs = createCard('clubs', '2');
      const hand = [twoOfClubs, createCard('hearts', 'A'), createCard('spades', 'K')];
      
      const danger = evaluateCardDanger(twoOfClubs, hand);
      
      expect(danger).toBeLessThan(10);
    });

    it('should rate high cards in short suits as more dangerous', () => {
      const aceOfSpades = createCard('spades', 'A');
      // Only 2 spades in hand - short suit
      const hand = [
        aceOfSpades,
        createCard('spades', '3'),
        createCard('hearts', '5'),
        createCard('hearts', '6'),
        createCard('clubs', '7')
      ];
      
      const danger = evaluateCardDanger(aceOfSpades, hand);
      
      // Should have bonus for being high card in short suit
      expect(danger).toBeGreaterThan(20);
    });
  });

  describe('selectAICardsToPass', () => {
    it('should select exactly 3 cards when passing left', () => {
      const hand = [
        createCard('spades', 'Q'),
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('clubs', '2'),
        createCard('diamonds', '3')
      ];
      
      const selected = selectAICardsToPass(hand, 'left');
      
      expect(selected).toHaveLength(3);
    });

    it('should select exactly 3 cards when passing right', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('hearts', 'Q'),
        createCard('clubs', '2'),
        createCard('diamonds', '3')
      ];
      
      const selected = selectAICardsToPass(hand, 'right');
      
      expect(selected).toHaveLength(3);
    });

    it('should select exactly 3 cards when passing across', () => {
      const hand = [
        createCard('spades', 'A'),
        createCard('spades', 'K'),
        createCard('spades', 'Q'),
        createCard('clubs', '2'),
        createCard('diamonds', '3')
      ];
      
      const selected = selectAICardsToPass(hand, 'across');
      
      expect(selected).toHaveLength(3);
    });

    it('should return empty array when direction is none', () => {
      const hand = [
        createCard('spades', 'Q'),
        createCard('hearts', 'A'),
        createCard('hearts', 'K')
      ];
      
      const selected = selectAICardsToPass(hand, 'none');
      
      expect(selected).toHaveLength(0);
    });

    it('should prioritize Queen of Spades if in hand', () => {
      const queenOfSpades = createCard('spades', 'Q');
      const hand = [
        queenOfSpades,
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('clubs', '2'),
        createCard('diamonds', '3')
      ];
      
      const selected = selectAICardsToPass(hand, 'left');
      
      // Queen of Spades should be in the selected cards
      expect(selected).toContainEqual(queenOfSpades);
    });

    it('should prioritize high Hearts', () => {
      const aceOfHearts = createCard('hearts', 'A');
      const kingOfHearts = createCard('hearts', 'K');
      const hand = [
        aceOfHearts,
        kingOfHearts,
        createCard('hearts', 'Q'),
        createCard('clubs', '2'),
        createCard('diamonds', '3'),
        createCard('spades', '4')
      ];
      
      const selected = selectAICardsToPass(hand, 'left');
      
      // Should include high Hearts
      expect(selected).toContainEqual(aceOfHearts);
      expect(selected).toContainEqual(kingOfHearts);
    });

    it('should select cards that are actually in the hand', () => {
      const hand = [
        createCard('spades', 'Q'),
        createCard('hearts', 'A'),
        createCard('hearts', 'K'),
        createCard('hearts', 'Q'),
        createCard('clubs', '2'),
        createCard('diamonds', '3')
      ];
      
      const selected = selectAICardsToPass(hand, 'left');
      
      // All selected cards should be in the original hand
      selected.forEach(card => {
        const inHand = hand.some(h => h.suit === card.suit && h.rank === card.rank);
        expect(inHand).toBe(true);
      });
    });

    it('should throw error if hand has fewer than 3 cards', () => {
      const hand = [
        createCard('hearts', 'A'),
        createCard('clubs', '2')
      ];
      
      expect(() => selectAICardsToPass(hand, 'left')).toThrow();
    });
  });
});
