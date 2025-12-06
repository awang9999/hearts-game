import type { Player, GameState } from '../models/GameState';

/**
 * Checks if the game should end (any player has reached 100 points or more)
 * Requirements: 7.1
 */
export function shouldGameEnd(players: Player[]): boolean {
  return players.some(player => player.totalScore >= 100);
}

/**
 * Determines the winner of the game (player with the lowest total score)
 * Returns the player ID of the winner
 * Requirements: 7.2
 */
export function determineWinner(players: Player[]): string {
  if (players.length === 0) {
    throw new Error('Cannot determine winner with no players');
  }
  
  let winner = players[0];
  for (let i = 1; i < players.length; i++) {
    if (players[i].totalScore < winner.totalScore) {
      winner = players[i];
    }
  }
  
  return winner.id;
}

/**
 * Transitions the game to the "gameOver" phase
 * Returns a new game state with the phase set to "gameOver"
 * Requirements: 7.1, 7.2
 */
export function transitionToGameOver(gameState: GameState): GameState {
  return {
    ...gameState,
    phase: 'gameOver'
  };
}

/**
 * Checks if the game should end and transitions to game over if needed
 * This is a convenience function that combines checking and transitioning
 * Requirements: 7.1, 7.2
 */
export function checkAndTransitionToGameOver(gameState: GameState): GameState {
  if (shouldGameEnd(gameState.players)) {
    return transitionToGameOver(gameState);
  }
  return gameState;
}
