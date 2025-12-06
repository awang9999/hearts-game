import type { GameState, Player, PlayedCard, GamePhase, PassingDirection } from '../models/GameState';
import type { Card } from '../models/Card';

/**
 * Serializable version of GameState that can be converted to JSON
 * Maps are not JSON-serializable, so we convert them to objects
 */
interface SerializableGameState {
  players: Player[];
  currentPlayerIndex: number;
  dealerIndex: number;
  phase: string;
  passingDirection: string;
  handNumber: number;
  currentTrick: PlayedCard[];
  heartsBroken: boolean;
  selectedCardsForPassing: Record<string, Card[]>;
}

const STORAGE_KEY = 'hearts-game-state';

/**
 * Serializes a GameState to a JSON string
 * Requirements: 11.4
 */
export function serializeGameState(gameState: GameState): string {
  const serializable: SerializableGameState = {
    players: gameState.players,
    currentPlayerIndex: gameState.currentPlayerIndex,
    dealerIndex: gameState.dealerIndex,
    phase: gameState.phase,
    passingDirection: gameState.passingDirection,
    handNumber: gameState.handNumber,
    currentTrick: gameState.currentTrick,
    heartsBroken: gameState.heartsBroken,
    selectedCardsForPassing: Object.fromEntries(gameState.selectedCardsForPassing)
  };
  
  return JSON.stringify(serializable);
}

/**
 * Deserializes a JSON string to a GameState
 * Requirements: 11.4
 */
export function deserializeGameState(json: string): GameState {
  const serializable: SerializableGameState = JSON.parse(json);
  
  return {
    players: serializable.players,
    currentPlayerIndex: serializable.currentPlayerIndex,
    dealerIndex: serializable.dealerIndex,
    phase: serializable.phase as GamePhase,
    passingDirection: serializable.passingDirection as PassingDirection,
    handNumber: serializable.handNumber,
    currentTrick: serializable.currentTrick,
    heartsBroken: serializable.heartsBroken,
    selectedCardsForPassing: new Map(Object.entries(serializable.selectedCardsForPassing))
  };
}

/**
 * Saves a GameState to localStorage
 * Requirements: 11.4
 */
export function saveGameState(gameState: GameState): void {
  try {
    const json = serializeGameState(gameState);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save game state:', error);
    // Continue execution - game can still be played without persistence
  }
}

/**
 * Loads a GameState from localStorage
 * Returns null if no saved state exists or if loading fails
 * Requirements: 11.4
 */
export function loadGameState(): GameState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return null;
    }
    return deserializeGameState(json);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clears the saved game state from localStorage
 */
export function clearSavedGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

/**
 * Checks if a saved game state exists in localStorage
 */
export function hasSavedGameState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
