import { describe, it, expect } from 'vitest';
import { createDeck, shuffle, deal } from './Deck';

describe('Deck', () => {
  describe('createDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should create a deck with all unique cards', () => {
      const deck = createDeck();
      const cardStrings = deck.map(c => `${c.suit}-${c.rank}`);
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(52);
    });

    it('should create a deck with 13 cards of each suit', () => {
      const deck = createDeck();
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      
      suits.forEach(suit => {
        const cardsOfSuit = deck.filter(c => c.suit === suit);
        expect(cardsOfSuit).toHaveLength(13);
      });
    });

    it('should create a deck with 4 cards of each rank', () => {
      const deck = createDeck();
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      
      ranks.forEach(rank => {
        const cardsOfRank = deck.filter(c => c.rank === rank);
        expect(cardsOfRank).toHaveLength(4);
      });
    });
  });

  describe('shuffle', () => {
    it('should return a deck with the same number of cards', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('should not mutate the original deck', () => {
      const deck = createDeck();
      const originalFirst = deck[0];
      shuffle(deck);
      expect(deck[0]).toEqual(originalFirst);
    });

    it('should contain all the same cards', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      
      const deckStrings = deck.map(c => `${c.suit}-${c.rank}`).sort();
      const shuffledStrings = shuffled.map(c => `${c.suit}-${c.rank}`).sort();
      
      expect(shuffledStrings).toEqual(deckStrings);
    });
  });

  describe('deal', () => {
    it('should deal 4 hands', () => {
      const deck = createDeck();
      const hands = deal(deck);
      expect(hands).toHaveLength(4);
    });

    it('should deal exactly 13 cards to each player', () => {
      const deck = createDeck();
      const hands = deal(deck);
      
      hands.forEach(hand => {
        expect(hand).toHaveLength(13);
      });
    });

    it('should deal all 52 cards', () => {
      const deck = createDeck();
      const hands = deal(deck);
      
      const totalCards = hands.reduce((sum, hand) => sum + hand.length, 0);
      expect(totalCards).toBe(52);
    });

    it('should not have duplicate cards across hands', () => {
      const deck = createDeck();
      const hands = deal(deck);
      
      const allCards = hands.flat();
      const cardStrings = allCards.map(c => `${c.suit}-${c.rank}`);
      const uniqueCards = new Set(cardStrings);
      
      expect(uniqueCards.size).toBe(52);
    });

    it('should throw error if deck does not have 52 cards', () => {
      const incompleteDeck = createDeck().slice(0, 40);
      expect(() => deal(incompleteDeck)).toThrow('Deck must contain exactly 52 cards to deal');
    });
  });
});
