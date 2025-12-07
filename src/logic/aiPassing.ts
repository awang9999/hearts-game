import type { Card } from '../models/Card';
import type { PassingDirection } from '../models/GameState';

/**
 * Evaluates the danger level of a card for passing strategy
 * Higher scores indicate more dangerous cards that should be passed
 * Requirements: 8.4
 * 
 * Advanced Strategy:
 * - Queen of Spades is most dangerous (13 points)
 * - Ace and King of Spades are risky (can force taking Queen)
 * - High Hearts are dangerous, especially Ace (prevents moon shots)
 * - High cards in short suits are very risky
 * - Protect very low cards (2-4) as they're valuable
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

  // Ace and King of Spades are risky (can force taking Queen)
  if (card.suit === 'spades' && (card.rank === 'A' || card.rank === 'K')) {
    dangerScore += 40;
  }

  // Hearts are penalty cards (1 point each)
  if (card.suit === 'hearts') {
    // Ace of Hearts is especially dangerous (prevents moon shots)
    if (card.rank === 'A') {
      dangerScore += 50;
    } else {
      // High Hearts are more dangerous
      dangerScore += card.value * 3;
    }
  }

  // High cards in any suit are risky (might win unwanted tricks)
  if (card.value >= 12) { // Q, K, A
    dangerScore += card.value;
  }

  // Very low cards (2-4) are valuable - don't pass them
  if (card.value >= 2 && card.value <= 4) {
    dangerScore -= 20; // Negative score = keep them
  }

  // Consider suit length - high cards in short suits are more dangerous
  const suitCards = hand.filter(c => c.suit === card.suit);
  const suitLength = suitCards.length;

  if (suitLength <= 3 && card.value >= 11) {
    // High cards in short suits are very risky
    dangerScore += (4 - suitLength) * 8;
  }

  // Being long in Spades (especially low ones) is good defense against Queen
  if (card.suit === 'spades' && suitLength >= 5 && card.value <= 11) {
    dangerScore -= 10; // Keep low spades if long in suit
  }

  return dangerScore;
}

/**
 * Selects 3 cards for an AI player to pass
 * Requirements: 8.4
 * 
 * Advanced Strategy:
 * 1. Prioritize passing Queen of Spades if held
 * 2. Pass Ace/King of Spades (risky with few spades)
 * 3. Pass high Hearts, especially Ace
 * 4. Pass high cards in short suits
 * 5. Avoid creating void suits unless strategic
 * 6. Keep very low cards (2-4) for control
 * 7. Keep low spades if long in suit (defense against Queen)
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

  // Count cards by suit
  const suitCounts = new Map<string, number>();
  for (const card of hand) {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
  }

  // Create a copy of the hand with danger scores
  const cardsWithDanger = hand.map(card => ({
    card,
    danger: evaluateCardDanger(card, hand),
    suitLength: suitCounts.get(card.suit) || 0
  }));

  // Sort by danger score (highest first)
  cardsWithDanger.sort((a, b) => b.danger - a.danger);

  // Select the 3 most dangerous cards, but avoid creating bad voids
  const selectedCards: Card[] = [];
  const passedSuits = new Set<string>();

  for (const item of cardsWithDanger) {
    if (selectedCards.length >= 3) break;

    // Check if passing this card would create a void
    const wouldCreateVoid = item.suitLength === 1;
    
    // Avoid creating void in spades if we have Queen (can't escape it)
    const hasQueenOfSpades = hand.some(c => c.suit === 'spades' && c.rank === 'Q');
    if (wouldCreateVoid && item.card.suit === 'spades' && hasQueenOfSpades) {
      continue; // Skip this card
    }

    // Creating a void can be strategic (allows sloughing)
    // But avoid if it's our only low card in that suit
    if (wouldCreateVoid && item.card.value <= 6) {
      // Check if we have other low cards to pass
      const otherHighDangerCards = cardsWithDanger.filter(
        c => c.danger > 20 && c.card.suit !== item.card.suit && selectedCards.length < 3
      );
      if (otherHighDangerCards.length > 0) {
        continue; // Skip creating this void, pass other dangerous cards
      }
    }

    selectedCards.push(item.card);
    passedSuits.add(item.card.suit);
  }

  // If we couldn't select 3 cards (edge case), just take top 3
  if (selectedCards.length < 3) {
    return cardsWithDanger.slice(0, 3).map(item => item.card);
  }

  // Ensure we're returning exactly 3 cards
  if (selectedCards.length !== 3) {
    throw new Error('AI must select exactly 3 cards to pass');
  }

  return selectedCards;
}
