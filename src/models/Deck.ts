import type { Card, Suit, Rank } from './Card';
import { createCard } from './Card';

/**
 * Creates a standard 52-card deck
 * Requirements: 1.2
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(createCard(suit, rank));
    }
  }
  
  return deck;
}

/**
 * Shuffles a deck using the Fisher-Yates algorithm
 * Requirements: 1.3
 */
export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck]; // Create a copy to avoid mutating the original
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Deals cards to 4 players, distributing them one at a time in clockwise order
 * Requirements: 1.3, 1.4
 */
export function deal(deck: Card[]): Card[][] {
  if (deck.length !== 52) {
    throw new Error('Deck must contain exactly 52 cards to deal');
  }
  
  const hands: Card[][] = [[], [], [], []];
  
  // Deal cards one at a time in clockwise order (eldest hand first)
  for (let i = 0; i < deck.length; i++) {
    const playerIndex = i % 4;
    hands[playerIndex].push(deck[i]);
  }
  
  return hands;
}
