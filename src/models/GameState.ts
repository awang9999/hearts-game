import type { Card } from './Card';

/**
 * Represents a card that has been played in a trick
 */
export interface PlayedCard {
  card: Card;
  playerId: string;
}

/**
 * Represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  tricksTaken: Card[][];
  score: number;
  totalScore: number;
}

/**
 * Represents the current phase of the game
 */
export type GamePhase = 'passing' | 'playing' | 'handComplete' | 'gameOver';

/**
 * Represents the direction cards are passed
 */
export type PassingDirection = 'left' | 'right' | 'across' | 'none';

/**
 * Represents the complete game state
 */
export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dealerIndex: number;
  phase: GamePhase;
  passingDirection: PassingDirection;
  handNumber: number;
  currentTrick: PlayedCard[];
  heartsBroken: boolean;
  selectedCardsForPassing: Map<string, Card[]>;
}

/**
 * Creates a new player
 */
export function createPlayer(id: string, name: string, isHuman: boolean): Player {
  return {
    id,
    name,
    isHuman,
    hand: [],
    tricksTaken: [],
    score: 0,
    totalScore: 0
  };
}

/**
 * Finds the player who has the 2 of clubs
 * Requirements: 3.1
 */
export function findPlayerWith2OfClubs(players: Player[]): number {
  for (let i = 0; i < players.length; i++) {
    const has2OfClubs = players[i].hand.some(card => 
      card.suit === 'clubs' && card.rank === '2'
    );
    if (has2OfClubs) {
      return i;
    }
  }
  return -1; // Should never happen in a valid game
}

/**
 * Determines the passing direction based on hand number
 * Requirements: 2.4
 */
export function getPassingDirection(handNumber: number): PassingDirection {
  const cycle: PassingDirection[] = ['left', 'right', 'across', 'none'];
  return cycle[(handNumber - 1) % 4];
}

/**
 * Gets the current player from the game state
 */
export function getCurrentPlayer(gameState: GameState): Player {
  return gameState.players[gameState.currentPlayerIndex];
}

/**
 * Gets the current phase of the game
 */
export function getCurrentPhase(gameState: GameState): GamePhase {
  return gameState.phase;
}

/**
 * Checks if it's currently a specific player's turn
 */
export function isPlayerTurn(gameState: GameState, playerId: string): boolean {
  return gameState.players[gameState.currentPlayerIndex].id === playerId;
}

/**
 * Gets the number of tricks played in the current hand
 */
export function getTricksPlayed(gameState: GameState): number {
  // All players should have the same number of tricks taken
  return gameState.players[0].tricksTaken.length;
}

/**
 * Checks if the current trick is the first trick of the hand
 */
export function isFirstTrick(gameState: GameState): boolean {
  return getTricksPlayed(gameState) === 0;
}

/**
 * Gets the led suit of the current trick (if any)
 */
export function getLedSuit(gameState: GameState): string | null {
  if (gameState.currentTrick.length === 0) {
    return null;
  }
  return gameState.currentTrick[0].card.suit;
}
