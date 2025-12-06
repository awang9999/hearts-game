import type { Card } from '../models/Card';
import type { GameState, PlayedCard, Player } from '../models/GameState';
import { wouldBreakHearts } from './moveValidation';

/**
 * Determines the winner of a completed trick
 * Requirements: 3.4
 * 
 * The winner is the player who played the highest card of the led suit
 * 
 * @param trick - The completed trick (must have 4 cards)
 * @returns The player ID of the trick winner
 */
export function determineTrickWinner(trick: PlayedCard[]): string {
  if (trick.length !== 4) {
    throw new Error('Trick must have exactly 4 cards to determine winner');
  }

  // The first card determines the led suit
  const ledSuit = trick[0].card.suit;

  // Find the highest card of the led suit
  let winningPlay = trick[0];
  let highestValue = trick[0].card.value;

  for (let i = 1; i < trick.length; i++) {
    const currentPlay = trick[i];
    const currentCard = currentPlay.card;

    // Only cards of the led suit can win
    if (currentCard.suit === ledSuit && currentCard.value > highestValue) {
      highestValue = currentCard.value;
      winningPlay = currentPlay;
    }
  }

  return winningPlay.playerId;
}

/**
 * Checks if the current hand is complete (all 13 tricks have been played)
 * Requirements: 3.5
 * 
 * @param gameState - The current game state
 * @returns true if all 13 tricks have been played
 */
export function isHandComplete(gameState: GameState): boolean {
  // Each player should have taken some number of tricks
  // The total number of tricks should be 13 when the hand is complete
  const totalTricks = gameState.players.reduce(
    (sum, player) => sum + player.tricksTaken.length,
    0
  );
  
  return totalTricks === 13;
}

/**
 * Gets the index of a player by their ID
 * 
 * @param players - Array of players
 * @param playerId - The player ID to find
 * @returns The index of the player, or -1 if not found
 */
function getPlayerIndex(players: Player[], playerId: string): number {
  return players.findIndex(player => player.id === playerId);
}

/**
 * Updates the game state after a trick is completed
 * Requirements: 3.4, 3.5
 * 
 * This function:
 * 1. Determines the trick winner
 * 2. Awards the trick to the winner
 * 3. Updates Hearts broken status if needed
 * 4. Sets the next player to the trick winner
 * 5. Clears the current trick
 * 6. Checks if the hand is complete
 * 
 * @param gameState - The current game state
 * @returns Updated game state
 */
export function resolveTrick(gameState: GameState): GameState {
  if (gameState.currentTrick.length !== 4) {
    throw new Error('Cannot resolve trick: trick is not complete');
  }

  // Determine the winner
  const winnerId = determineTrickWinner(gameState.currentTrick);
  const winnerIndex = getPlayerIndex(gameState.players, winnerId);

  if (winnerIndex === -1) {
    throw new Error('Trick winner not found in players array');
  }

  // Check if Hearts should be broken by any card in this trick
  let newHeartsBroken = gameState.heartsBroken;
  for (const playedCard of gameState.currentTrick) {
    if (wouldBreakHearts(playedCard.card, gameState)) {
      newHeartsBroken = true;
      break;
    }
  }

  // Extract all cards from the trick
  const trickCards = gameState.currentTrick.map(pc => pc.card);

  // Update players: award trick to winner
  const updatedPlayers = gameState.players.map((player, index) => {
    if (index === winnerIndex) {
      return {
        ...player,
        tricksTaken: [...player.tricksTaken, trickCards]
      };
    }
    return player;
  });

  // Create updated game state
  const updatedState: GameState = {
    ...gameState,
    players: updatedPlayers,
    currentPlayerIndex: winnerIndex, // Winner leads next trick
    currentTrick: [], // Clear the trick
    heartsBroken: newHeartsBroken
  };

  // Check if hand is complete
  if (isHandComplete(updatedState)) {
    return {
      ...updatedState,
      phase: 'handComplete'
    };
  }

  return updatedState;
}

/**
 * Adds a card to the current trick
 * 
 * @param gameState - The current game state
 * @param card - The card being played
 * @param playerId - The ID of the player playing the card
 * @returns Updated game state with the card added to the trick
 */
export function addCardToTrick(
  gameState: GameState,
  card: Card,
  playerId: string
): GameState {
  const playedCard: PlayedCard = { card, playerId };

  // Check if Hearts should be broken by this play
  let newHeartsBroken = gameState.heartsBroken;
  if (wouldBreakHearts(card, gameState)) {
    newHeartsBroken = true;
  }

  return {
    ...gameState,
    currentTrick: [...gameState.currentTrick, playedCard],
    heartsBroken: newHeartsBroken
  };
}
