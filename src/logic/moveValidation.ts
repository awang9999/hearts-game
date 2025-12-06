import type { Card } from '../models/Card';
import type { GameState } from '../models/GameState';
import { getLedSuit, isFirstTrick } from '../models/GameState';

/**
 * Checks if a card is a Heart
 */
export function isHeart(card: Card): boolean {
  return card.suit === 'hearts';
}

/**
 * Checks if a card is the Queen of Spades
 */
export function isQueenOfSpades(card: Card): boolean {
  return card.suit === 'spades' && card.rank === 'Q';
}

/**
 * Checks if a card is a penalty card (Heart or Queen of Spades)
 * Requirements: 5.1
 */
export function isPenaltyCard(card: Card): boolean {
  return isHeart(card) || isQueenOfSpades(card);
}

/**
 * Checks if a card follows the led suit
 * Requirements: 3.2
 */
export function followsSuit(card: Card, ledSuit: string): boolean {
  return card.suit === ledSuit;
}

/**
 * Checks if a player has any cards of a specific suit
 * Requirements: 3.2, 3.3
 */
export function hasSuit(hand: Card[], suit: string): boolean {
  return hand.some(card => card.suit === suit);
}

/**
 * Checks if a player has only Hearts in their hand
 * Requirements: 4.3
 */
export function hasOnlyHearts(hand: Card[]): boolean {
  return hand.length > 0 && hand.every(card => isHeart(card));
}

/**
 * Checks if a player has only penalty cards in their hand
 * Requirements: 5.2
 */
export function hasOnlyPenaltyCards(hand: Card[]): boolean {
  return hand.length > 0 && hand.every(card => isPenaltyCard(card));
}

/**
 * Validates if a card can be played on the first trick
 * Requirements: 5.1, 5.2
 * 
 * On the first trick:
 * - Penalty cards (Hearts and Q♠) cannot be played
 * - UNLESS the player has only penalty cards
 */
export function isValidFirstTrickPlay(card: Card, hand: Card[]): boolean {
  // If the card is not a penalty card, it's valid
  if (!isPenaltyCard(card)) {
    return true;
  }

  // If the card is a penalty card, it's only valid if the player has only penalty cards
  return hasOnlyPenaltyCards(hand);
}

/**
 * Validates if a Heart can be led
 * Requirements: 4.1, 4.3
 * 
 * Hearts cannot be led until Hearts have been broken,
 * UNLESS the player has only Hearts in their hand
 */
export function canLeadHearts(hand: Card[], heartsBroken: boolean): boolean {
  // If Hearts are broken, they can be led
  if (heartsBroken) {
    return true;
  }

  // If the player has only Hearts, they can lead Hearts
  return hasOnlyHearts(hand);
}

/**
 * Gets all valid plays for a player given the current game state
 * Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2
 */
export function getValidPlays(hand: Card[], gameState: GameState): Card[] {
  const { heartsBroken } = gameState;
  const ledSuit = getLedSuit(gameState);
  const isFirst = isFirstTrick(gameState);

  // If leading the trick (no cards played yet)
  if (ledSuit === null) {
    // On the very first trick, the 2 of clubs must be played
    if (isFirst && gameState.currentTrick.length === 0) {
      const twoOfClubs = hand.find(card => card.suit === 'clubs' && card.rank === '2');
      if (twoOfClubs) {
        return [twoOfClubs];
      }
    }

    const validCards = hand.filter(card => {
      // First trick restrictions
      if (isFirst && !isValidFirstTrickPlay(card, hand)) {
        return false;
      }

      // Hearts leading restriction (only applies when not first trick or when Hearts can't be led)
      if (isHeart(card) && !canLeadHearts(hand, heartsBroken)) {
        return false;
      }

      return true;
    });

    // If no valid cards (shouldn't happen in a valid game), return all cards
    return validCards.length > 0 ? validCards : [...hand];
  }

  // If following suit
  const hasSuitCards = hasSuit(hand, ledSuit);

  if (hasSuitCards) {
    // Must follow suit if able
    return hand.filter(card => followsSuit(card, ledSuit));
  } else {
    // Can play any card when unable to follow suit
    // But first trick restrictions still apply
    if (isFirst) {
      return hand.filter(card => isValidFirstTrickPlay(card, hand));
    }
    return [...hand]; // All cards are valid
  }
}

/**
 * Comprehensive validation function to check if a specific card play is valid
 * Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2
 * 
 * @param card - The card to play
 * @param hand - The player's current hand
 * @param gameState - The current game state
 * @returns true if the play is valid, false otherwise
 */
export function isValidPlay(card: Card, hand: Card[], gameState: GameState): boolean {
  const validPlays = getValidPlays(hand, gameState);
  return validPlays.some(validCard => 
    validCard.suit === card.suit && validCard.rank === card.rank
  );
}

/**
 * Checks if playing a card would break Hearts
 * Requirements: 4.2
 * 
 * Hearts are broken when a Heart is played off-suit (sloughed)
 */
export function wouldBreakHearts(card: Card, gameState: GameState): boolean {
  const ledSuit = getLedSuit(gameState);
  
  // Hearts are broken if:
  // 1. The card is a Heart
  // 2. It's not being led (there's a led suit)
  // 3. The led suit is not Hearts (playing off-suit)
  return isHeart(card) && ledSuit !== null && ledSuit !== 'hearts';
}

