export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14 for comparison
}

/**
 * Creates a single card with the given suit and rank
 */
export function createCard(suit: Suit, rank: Rank): Card {
  const rankValues: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  
  return {
    suit,
    rank,
    value: rankValues[rank]
  };
}

/**
 * Checks if two cards are equal
 */
export function cardsEqual(card1: Card, card2: Card): boolean {
  return card1.suit === card2.suit && card1.rank === card2.rank;
}

/**
 * Creates a string representation of a card
 */
export function cardToString(card: Card): string {
  return `${card.rank}${card.suit.charAt(0).toUpperCase()}`;
}
