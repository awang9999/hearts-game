import type { Card } from '../models/Card';
import type { PassingDirection } from '../models/GameState';

/**
 * Evaluates the danger level of a card for passing strategy
 * Higher scores indicate more dangerous cards that should be passed
 * Requirements: 8.4
 * 
 * Strategy:
 * - Queen of Spades is most dangerous (13 points)
 * - High Hearts are dangerous (A, K, Q worth more)
 * - High cards in short suits are risky
 * 
 * @param card - The card to evaluate
 * @param hand - The player's complete hand for context
 * @returns Danger score (higher = more dangerous)
 */
export function evaluateCardDanger(card: Card, hand: Card[]): number {
  let dangerScore = 0;

  // Queen of Spades is extremely dangerous (13 points)
  if (card.suit === 'spades' && card.rank === 'Q') {
    return 100; // Highest priority to pass
  }

  // Hearts are penalty cards (1 point each)
  if (card.suit === 'hearts') {
    // High Hearts are more dangerous
    // A=14, K=13, Q=12, J=11, etc.
    dangerScore += card.value * 3; // Weight Hearts heavily
  }

  // High cards in any suit are risky (might win unwanted tricks)
  if (card.value >= 12) { // Q, K, A
    dangerScore += card.value;
  }

  // Consider suit length - high cards in short suits are more dangerous
  const suitCards = hand.filter(c => c.suit === card.suit);
  const suitLength = suitCards.length;

  if (suitLength <= 3 && card.value >= 11) {
    // High cards in short suits are risky
    dangerScore += (4 - suitLength) * 5;
  }

  return dangerScore;
}

/**
 * Selects 3 cards for an AI player to pass
 * Requirements: 8.4
 * 
 * Strategy:
 * 1. Prioritize passing Queen of Spades if held
 * 2. Pass high Hearts (A, K, Q)
 * 3. Pass high cards in short suits
 * 4. Avoid creating void suits that force taking penalties
 * 
 * @param hand - The AI player's hand
 * @param direction - The passing direction (for future strategic considerations)
 * @returns Array of exactly 3 cards to pass
 */
export function selectAICardsToPass(hand: Card[], direction: PassingDirection): Card[] {
  // If no passing this round, return empty array
  if (direction === 'none') {
    return [];
  }

  // Validate hand has at least 3 cards
  if (hand.length < 3) {
    throw new Error('Hand must have at least 3 cards to pass');
  }

  // Create a copy of the hand with danger scores
  const cardsWithDanger = hand.map(card => ({
    card,
    danger: evaluateCardDanger(card, hand)
  }));

  // Sort by danger score (highest first)
  cardsWithDanger.sort((a, b) => b.danger - a.danger);

  // Select the 3 most dangerous cards
  const selectedCards = cardsWithDanger.slice(0, 3).map(item => item.card);

  // Ensure we're returning exactly 3 cards
  if (selectedCards.length !== 3) {
    throw new Error('AI must select exactly 3 cards to pass');
  }

  return selectedCards;
}
