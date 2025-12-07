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
 * Advanced Strategy:
 * 1. Lead very low cards (2-4) to deliberately lose the lead
 * 2. "Smoke out" Queen of Spades by leading low spades if we don't have it
 * 3. Hold low hearts for dangerous final tricks
 * 4. Lead from long suits for control
 * 5. If forced to lead Hearts, be strategic about timing
 * 
 * @param hand - The AI player's hand
 * @param validPlays - The valid cards that can be played
 * @param gameState - The current game state
 * @returns The card to play
 */
export function selectCardToLead(hand: Card[], validPlays: Card[], gameState: GameState): Card {
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

  // Calculate how many tricks have been played (early vs late game)
  const tricksPlayed = gameState.players[0].tricksTaken.length;
  const isEarlyGame = tricksPlayed < 4;
  const isLateGame = tricksPlayed >= 10;

  // Separate valid plays by type
  const nonHearts = validPlays.filter(c => !isHeart(c));
  const hearts = validPlays.filter(c => isHeart(c));

  // Prefer to lead non-Hearts if possible
  if (nonHearts.length > 0) {
    // Check if we have the Queen of Spades
    const hasQueenOfSpades = hand.some(c => isQueenOfSpades(c));

    // Strategy: "Smoke out" the Queen of Spades in early game
    if (isEarlyGame && !hasQueenOfSpades) {
      const spades = nonHearts.filter(c => c.suit === 'spades');
      if (spades.length > 0) {
        // Lead low spades to force out the Queen
        const lowSpades = spades.filter(c => c.value <= 11); // J or lower
        if (lowSpades.length > 0) {
          return lowSpades.reduce((lowest, card) => 
            card.value < lowest.value ? card : lowest
          );
        }
      }
    }

    // Strategy: Lead very low cards (2-4) to deliberately lose the lead
    const veryLowCards = nonHearts.filter(c => c.value >= 2 && c.value <= 4);
    if (veryLowCards.length > 0 && !isLateGame) {
      // Prefer leading from longest suit for control
      const cardsWithSuitLength = veryLowCards.map(card => ({
        card,
        suitLength: suitCounts.get(card.suit) || 0
      }));
      cardsWithSuitLength.sort((a, b) => b.suitLength - a.suitLength);
      return cardsWithSuitLength[0].card;
    }

    // Strategy: Lead from longest suit (more control)
    const cardsWithSuitLength = nonHearts.map(card => ({
      card,
      suitLength: suitCounts.get(card.suit) || 0,
      isHigh: card.value >= 12 // Q, K, A
    }));

    // Sort by: avoid high cards, prefer long suits, then low values
    cardsWithSuitLength.sort((a, b) => {
      // Avoid leading high cards
      if (a.isHigh !== b.isHigh) {
        return a.isHigh ? 1 : -1;
      }
      // Prefer longer suits
      if (b.suitLength !== a.suitLength) {
        return b.suitLength - a.suitLength;
      }
      // Prefer lower values
      return a.card.value - b.card.value;
    });

    return cardsWithSuitLength[0].card;
  }

  // Strategy: If forced to lead Hearts, timing matters
  if (hearts.length > 0) {
    // In late game, hold low hearts for passing the lead
    if (isLateGame) {
      const lowHearts = hearts.filter(c => c.value <= 7);
      if (lowHearts.length > 0) {
        // Keep the very lowest, lead the next lowest
        const sorted = lowHearts.sort((a, b) => a.value - b.value);
        return sorted.length > 1 ? sorted[1] : sorted[0];
      }
    }

    // Otherwise lead high Hearts to avoid taking them later
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
 * Advanced Strategy:
 * 1. "Undershooting" - play just below the current high card to avoid winning
 * 2. Protect very low cards (2-4) for late game safety
 * 3. On first trick, play highest card (no penalty risk)
 * 4. Avoid taking tricks with Queen of Spades or Hearts
 * 5. If must win, minimize damage
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
  let trickHasQueenOfSpades = false;
  let trickHasHearts = false;

  for (const playedCard of gameState.currentTrick) {
    if (playedCard.card.suit === ledSuit && playedCard.card.value > highestValueInTrick) {
      highestValueInTrick = playedCard.card.value;
    }
    if (isQueenOfSpades(playedCard.card)) {
      trickHasQueenOfSpades = true;
    }
    if (isHeart(playedCard.card)) {
      trickHasHearts = true;
    }
  }

  // Separate cards into those that would win and those that wouldn't
  const winningCards = validPlays.filter(c => c.value > highestValueInTrick);
  const losingCards = validPlays.filter(c => c.value <= highestValueInTrick);

  // Calculate game stage
  const tricksPlayed = gameState.players[0].tricksTaken.length;
  const isFirstTrick = tricksPlayed === 0;
  const isLateGame = tricksPlayed >= 10;

  // On first trick, play highest card (no penalty risk)
  if (isFirstTrick && gameState.currentTrick.length < 4) {
    return validPlays.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // Strategy: Protect very low cards (2-4) for late game
  const otherCards = validPlays.filter(c => c.value > 4);

  // If we can avoid winning, do so
  if (losingCards.length > 0) {
    // Strategy: "Undershooting" - play just below the high card
    // But protect very low cards unless late game or no choice
    const losingNonLow = losingCards.filter(c => c.value > 4);
    
    if (losingNonLow.length > 0) {
      // Play the highest card that won't win (undershooting)
      return losingNonLow.reduce((highest, card) => 
        card.value > highest.value ? card : highest
      );
    }

    // If only very low cards available, use them in late game
    if (isLateGame || losingCards.length === validPlays.length) {
      return losingCards.reduce((highest, card) => 
        card.value > highest.value ? card : highest
      );
    }
  }

  // If we must win, try to minimize damage
  if (winningCards.length > 0) {
    // Check if trick has dangerous cards
    const trickIsDangerous = trickHasQueenOfSpades || trickHasHearts;
    
    // If trick is dangerous and we have non-low cards, use those first
    if (trickIsDangerous && otherCards.length > 0) {
      const winningNonLow = winningCards.filter(c => c.value > 4);
      if (winningNonLow.length > 0) {
        // Play the lowest winning card (but not very low)
        return winningNonLow.reduce((lowest, card) => 
          card.value < lowest.value ? card : lowest
        );
      }
    }

    // Play the lowest winning card
    return winningCards.reduce((lowest, card) => 
      card.value < lowest.value ? card : lowest
    );
  }

  // Fallback: prefer non-low cards if available
  if (otherCards.length > 0) {
    return otherCards.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  return validPlays[0];
}

/**
 * Selects a card for the AI to slough (play off-suit)
 * Requirements: 8.1, 8.2
 * 
 * Advanced Strategy:
 * 1. Being void is advantageous - use it to dump dangerous cards
 * 2. Prioritize dumping Queen of Spades when safe
 * 3. Dump high Hearts (especially Ace of Hearts if not shooting moon)
 * 4. Dump high face cards that could win unwanted tricks
 * 5. Protect very low cards (2-4) for future control
 * 6. Consider who will win the trick
 * 
 * @param hand - The AI player's hand
 * @param validPlays - The valid cards that can be played
 * @param gameState - The current game state
 * @returns The card to play
 */
export function selectCardToSlough(_hand: Card[], validPlays: Card[], gameState: GameState): Card {
  if (validPlays.length === 0) {
    throw new Error('No valid plays available');
  }

  // If only one valid play, return it
  if (validPlays.length === 1) {
    return validPlays[0];
  }

  // Check if we're the last to play (most certain about who wins)
  const isLastToPlay = gameState.currentTrick.length === 3;

  // Strategy: Prioritize dumping Queen of Spades when safe
  const queenOfSpades = validPlays.find(c => isQueenOfSpades(c));
  if (queenOfSpades) {
    return queenOfSpades;
  }

  // Separate cards by type
  const hearts = validPlays.filter(c => isHeart(c));
  const aceOfHearts = hearts.find(c => c.rank === 'A');
  const highCards = validPlays.filter(c => c.value >= 12); // Q, K, A

  // Strategy: Dump Ace of Hearts (prevents moon shots and is high penalty)
  if (aceOfHearts && isLastToPlay) {
    return aceOfHearts;
  }

  // Strategy: Dump high Hearts
  if (hearts.length > 0) {
    const highHearts = hearts.filter(c => c.value >= 10);
    if (highHearts.length > 0) {
      // Dump highest Heart
      return highHearts.reduce((highest, card) => 
        card.value > highest.value ? card : highest
      );
    }
  }

  // Strategy: Dump high face cards (dangerous in other suits)
  if (highCards.length > 0) {
    const highNonHearts = highCards.filter(c => !isHeart(c));
    if (highNonHearts.length > 0) {
      return highNonHearts.reduce((highest, card) => 
        card.value > highest.value ? card : highest
      );
    }
    // If only high hearts left, dump highest
    return highCards.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // Strategy: Dump remaining Hearts (but keep very low ones if possible)
  if (hearts.length > 0) {
    const nonLowHearts = hearts.filter(c => c.value > 4);
    if (nonLowHearts.length > 0) {
      return nonLowHearts.reduce((highest, card) => 
        card.value > highest.value ? card : highest
      );
    }
  }

  // Strategy: Protect very low cards (2-4) - they guarantee not winning tricks
  const nonVeryLow = validPlays.filter(c => c.value > 4);
  if (nonVeryLow.length > 0) {
    // Dump highest non-very-low card
    return nonVeryLow.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }

  // Last resort: dump highest card (even if very low)
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
