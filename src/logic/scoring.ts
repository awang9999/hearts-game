import type { Card } from '../models/Card';
import type { Player } from '../models/GameState';

/**
 * Counts the number of Hearts in a set of tricks
 * Requirements: 6.1
 */
export function countHearts(tricks: Card[][]): number {
  let count = 0;
  for (const trick of tricks) {
    for (const card of trick) {
      if (card.suit === 'hearts') {
        count++;
      }
    }
  }
  return count;
}

/**
 * Checks if the Queen of Spades is in a set of tricks
 * Requirements: 6.2
 */
export function hasQueenOfSpades(tricks: Card[][]): boolean {
  for (const trick of tricks) {
    for (const card of trick) {
      if (card.suit === 'spades' && card.rank === 'Q') {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calculates the score for a single hand based on tricks taken
 * Returns the number of penalty points (Hearts + Queen of Spades)
 * Requirements: 6.1, 6.2
 */
export function calculateHandScore(tricksTaken: Card[][]): number {
  const heartsCount = countHearts(tricksTaken);
  const hasQueen = hasQueenOfSpades(tricksTaken);
  
  return heartsCount + (hasQueen ? 13 : 0);
}

/**
 * Checks if a player has shot the moon (captured all 26 penalty points)
 * Requirements: 6.3
 */
export function hasShotTheMoon(score: number): boolean {
  return score === 26;
}

/**
 * Applies shooting the moon score adjustment
 * If a player shot the moon, either subtract 26 from their score
 * or add 26 to all other players' scores
 * 
 * This implementation subtracts 26 from the shooter's score
 * Requirements: 6.3
 */
export function applyShootingTheMoon(players: Player[]): void {
  // Find if any player shot the moon
  let shooterIndex = -1;
  for (let i = 0; i < players.length; i++) {
    if (hasShotTheMoon(players[i].score)) {
      shooterIndex = i;
      break;
    }
  }
  
  // If someone shot the moon, apply the adjustment
  if (shooterIndex !== -1) {
    // Subtract 26 from the shooter's score
    players[shooterIndex].score = -26;
  }
}

/**
 * Updates cumulative scores for all players after a hand completes
 * Requirements: 6.4
 */
export function updateCumulativeScores(players: Player[]): void {
  for (const player of players) {
    player.totalScore += player.score;
  }
}

/**
 * Calculates scores for all players at the end of a hand
 * This is the main scoring function that orchestrates the entire scoring process
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function scoreHand(players: Player[]): void {
  // Calculate each player's hand score
  for (const player of players) {
    player.score = calculateHandScore(player.tricksTaken);
  }
  
  // Apply shooting the moon adjustment if applicable
  applyShootingTheMoon(players);
  
  // Update cumulative scores
  updateCumulativeScores(players);
}
