import type { Card } from '../models/Card';
import type { GameState } from '../models/GameState';
import { getLedSuit } from '../models/GameState';
import { getValidPlays, isHeart, isQueenOfSpades, hasSuit } from './moveValidation';

/**
 * Evaluates the safety of playing a card
 * Requirements: 8.1, 8.2
 * 
 * Lower scores indicate safer cards to play
 * Higher scores indicate more dangerous cards
 * 
 * @param card - The card to evaluate
 * @param hand - The player's complete hand
 * @param gameState - The current game state
 * @returns Safety score (lower = safer)
 */
export function evaluateCardSafety(card: Card, _hand: Card[], _gameState: GameState): number {
  let safetyScore = 0;

  // Queen of Spades is very dangerous to take (13 points)
  if (isQueenOfSpades(card)) {
    safetyScore += 50;
  }

  // Hearts are penalty cards (1 point each)
  if (isHeart(card)) {
    // Higher Hearts are more dangerous
    safetyScore += card.value * 2;
  }

  // High cards are generally riskier (might win unwanted tricks)
  if (card.value >= 12) { // Q, K, A
    safetyScore += card.value;
  }

  return safetyScore;
}

/**
 * Selects a card for the AI to lead a trick
 * Requirements: 8.1, 8.2
 * 
 * Strategy:
 * 1. Lead low cards from long suits
 * 2. Avoid leading suits where we hold high cards
 * 3. Lead spades if we don't have the Queen
 * 4. If forced to lead Hearts, lead high Hearts
 * 
 * @param hand - The AI player's hand
 * @param validPlays - The valid cards that can be played
 * @param gameState - The current game state
 * @returns The card to play
 */
export function selectCardToLead(hand: Card[], validPlays: Card[], _gameState: GameState): Card {
  if (validPlays.length === 0) {
    throw new Error('No valid plays available');
  }

  // If only one valid play, return it
  if (validPlays.length === 1) {
    return validPlays[0];
  }

  // Count cards by suit to determine suit lengths
  const suitCounts = new Map<string, number>();
  for (const card of hand) {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
  }

  // Separate valid plays by type
  const nonHearts = validPlays.filter(c => !isHeart(c));
  const hearts = validPlays.filter(c => isHeart(c));

  // Prefer to lead non-Hearts if possible
  if (nonHearts.length > 0) {
    // Check if we have the Queen of Spades
    const hasQueenOfSpades = hand.some(c => isQueenOfSpades(c));

    // If we don't have Queen of Spades, spades are safe to lead
    if (!hasQueenOfSpades) {
      const spades = nonHearts.filter(c => c.suit === 'spades');
      if (spades.length > 0) {
        // Lead lowest spade
        return spades.reduce((lowest, card) => 
          card.value < lowest.value ? card : lowest
        );
      }
    }

    // Lead from longest suit (more control)
    const cardsWithSuitLength = nonHearts.map(card => ({
      card,
      suitLength: suitCounts.get(card.suit) || 0
    }));

    // Sort by suit length (descending), then by card value (ascending)
    cardsWithSuitLength.sort((a, b) => {
      if (b.suitLength !== a.suitLength) {
        return b.suitLength - a.suitLength;
      }
      return a.card.value - b.card.value;
    });

    return cardsWithSuitLength[0].card;
  }

  // If we must lead Hearts, lead high Hearts to avoid taking them later
  if (hearts.length > 0) {
    return hearts.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // Fallback: return first valid play
  return validPlays[0];
}

/**
 * Selects a card for the AI to follow suit
 * Requirements: 8.1, 8.2
 * 
 * Strategy:
 * 1. If we cannot win the trick, play the highest card that won't win
 * 2. If we must win, play the lowest card that wins
 * 3. On the first trick, play the highest card possible (no points)
 * 4. Avoid taking the Queen of Spades unless shooting the moon
 * 
 * @param hand - The AI player's hand
 * @param validPlays - The valid cards that can be played (all same suit)
 * @param gameState - The current game state
 * @returns The card to play
 */
export function selectCardToFollow(_hand: Card[], validPlays: Card[], gameState: GameState): Card {
  if (validPlays.length === 0) {
    throw new Error('No valid plays available');
  }

  // If only one valid play, return it
  if (validPlays.length === 1) {
    return validPlays[0];
  }

  const ledSuit = getLedSuit(gameState);
  if (!ledSuit) {
    throw new Error('Cannot follow suit when no suit has been led');
  }

  // Find the highest card played so far in the led suit
  let highestValueInTrick = 0;

  for (const playedCard of gameState.currentTrick) {
    if (playedCard.card.suit === ledSuit && playedCard.card.value > highestValueInTrick) {
      highestValueInTrick = playedCard.card.value;
    }
  }

  // Separate cards into those that would win and those that wouldn't
  const winningCards = validPlays.filter(c => c.value > highestValueInTrick);
  const losingCards = validPlays.filter(c => c.value <= highestValueInTrick);

  // On first trick, play highest card (no penalty risk)
  const tricksPlayed = gameState.players[0].tricksTaken.length;
  if (tricksPlayed === 0 && gameState.currentTrick.length < 4) {
    return validPlays.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // If we can avoid winning, do so
  if (losingCards.length > 0) {
    // Play the highest card that won't win (get rid of high cards safely)
    return losingCards.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // If we must win, try to minimize damage
  if (winningCards.length > 0) {
    // If the trick has penalties, try to avoid winning if possible
    // But if we must win, play the lowest winning card
    return winningCards.reduce((lowest, card) => 
      card.value < lowest.value ? card : lowest
    );
  }

  // Fallback: return first valid play
  return validPlays[0];
}

/**
 * Selects a card for the AI to slough (play off-suit)
 * Requirements: 8.1, 8.2
 * 
 * Strategy:
 * 1. If someone else will take the trick, dump high penalty cards
 * 2. Prioritize dumping Queen of Spades if safe
 * 3. Dump high Hearts
 * 4. Keep low cards for future control
 * 
 * @param hand - The AI player's hand
 * @param validPlays - The valid cards that can be played
 * @param gameState - The current game state
 * @returns The card to play
 */
export function selectCardToSlough(_hand: Card[], validPlays: Card[], _gameState: GameState): Card {
  if (validPlays.length === 0) {
    throw new Error('No valid plays available');
  }

  // If only one valid play, return it
  if (validPlays.length === 1) {
    return validPlays[0];
  }

  // Prioritize getting rid of dangerous cards
  const queenOfSpades = validPlays.find(c => isQueenOfSpades(c));
  if (queenOfSpades) {
    return queenOfSpades;
  }

  // Dump high Hearts
  const hearts = validPlays.filter(c => isHeart(c));
  if (hearts.length > 0) {
    // Dump highest Heart
    return hearts.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // Dump other high cards
  const highCards = validPlays.filter(c => c.value >= 12); // Q, K, A
  if (highCards.length > 0) {
    return highCards.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // Keep low cards, so dump highest remaining card
  return validPlays.reduce((highest, card) => 
    card.value > highest.value ? card : highest
  );
}

/**
 * Selects a card for the AI to play
 * Requirements: 8.1, 8.2
 * 
 * Main entry point for AI card selection
 * Ensures AI always selects valid moves
 * 
 * @param hand - The AI player's hand
 * @param gameState - The current game state
 * @returns The card to play
 */
export function selectAICardToPlay(hand: Card[], gameState: GameState): Card {
  // Get all valid plays
  const validPlays = getValidPlays(hand, gameState);

  if (validPlays.length === 0) {
    throw new Error('No valid plays available for AI');
  }

  // If only one valid play, return it
  if (validPlays.length === 1) {
    return validPlays[0];
  }

  const ledSuit = getLedSuit(gameState);

  // If leading the trick
  if (ledSuit === null) {
    return selectCardToLead(hand, validPlays, gameState);
  }

  // If following suit
  const canFollowSuit = hasSuit(hand, ledSuit);
  if (canFollowSuit) {
    return selectCardToFollow(hand, validPlays, gameState);
  }

  // If sloughing (playing off-suit)
  return selectCardToSlough(hand, validPlays, gameState);
}
