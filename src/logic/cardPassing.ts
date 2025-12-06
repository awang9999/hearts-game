import type { Card } from '../models/Card';
import { cardsEqual } from '../models/Card';
import type { GameState, PassingDirection } from '../models/GameState';

/**
 * Validates that exactly 3 cards have been selected for passing
 * Requirements: 2.1
 */
export function validatePassingSelection(selectedCards: Card[]): boolean {
  return selectedCards.length === 3;
}

/**
 * Validates that all selected cards are in the player's hand
 * Requirements: 2.1
 */
export function validateCardsInHand(selectedCards: Card[], hand: Card[]): boolean {
  return selectedCards.every(selectedCard =>
    hand.some(handCard => cardsEqual(selectedCard, handCard))
  );
}

/**
 * Gets the target player index for passing based on direction
 * Requirements: 2.2
 */
export function getPassingTargetIndex(
  playerIndex: number,
  direction: PassingDirection,
  numPlayers: number = 4
): number {
  if (direction === 'none') {
    return playerIndex; // No passing
  }

  switch (direction) {
    case 'left':
      return (playerIndex + 1) % numPlayers;
    case 'right':
      return (playerIndex - 1 + numPlayers) % numPlayers;
    case 'across':
      return (playerIndex + 2) % numPlayers;
    default:
      return playerIndex;
  }
}

/**
 * Removes cards from a player's hand
 */
function removeCardsFromHand(hand: Card[], cardsToRemove: Card[]): Card[] {
  return hand.filter(handCard =>
    !cardsToRemove.some(removeCard => cardsEqual(removeCard, handCard))
  );
}

/**
 * Adds cards to a player's hand
 */
function addCardsToHand(hand: Card[], cardsToAdd: Card[]): Card[] {
  return [...hand, ...cardsToAdd];
}

/**
 * Executes the card passing exchange for all players
 * Requirements: 2.2, 2.3
 * 
 * @param gameState - The current game state
 * @returns Updated game state with cards exchanged
 */
export function executeCardPassing(gameState: GameState): GameState {
  const { players, passingDirection, selectedCardsForPassing } = gameState;

  // If no passing this hand, just transition to playing phase
  if (passingDirection === 'none') {
    return {
      ...gameState,
      phase: 'playing',
      selectedCardsForPassing: new Map()
    };
  }

  // Validate that all players have selected cards
  const allPlayersSelected = players.every(player =>
    selectedCardsForPassing.has(player.id) &&
    validatePassingSelection(selectedCardsForPassing.get(player.id)!)
  );

  if (!allPlayersSelected) {
    throw new Error('Not all players have selected cards for passing');
  }

  // Create a map of cards each player will receive
  const cardsToReceive = new Map<string, Card[]>();

  players.forEach((player, index) => {
    const selectedCards = selectedCardsForPassing.get(player.id)!;
    const targetIndex = getPassingTargetIndex(index, passingDirection, players.length);
    const targetPlayerId = players[targetIndex].id;

    // Validate cards are in hand
    if (!validateCardsInHand(selectedCards, player.hand)) {
      throw new Error(`Player ${player.id} selected cards not in their hand`);
    }

    // Store cards for the target player
    if (!cardsToReceive.has(targetPlayerId)) {
      cardsToReceive.set(targetPlayerId, []);
    }
    cardsToReceive.get(targetPlayerId)!.push(...selectedCards);
  });

  // Update all player hands
  const updatedPlayers = players.map(player => {
    const selectedCards = selectedCardsForPassing.get(player.id)!;
    const receivedCards = cardsToReceive.get(player.id) || [];

    // Remove selected cards and add received cards
    let newHand = removeCardsFromHand(player.hand, selectedCards);
    newHand = addCardsToHand(newHand, receivedCards);

    return {
      ...player,
      hand: newHand
    };
  });

  // Transition to playing phase and clear selected cards
  return {
    ...gameState,
    players: updatedPlayers,
    phase: 'playing',
    selectedCardsForPassing: new Map()
  };
}

/**
 * Selects cards for passing for a specific player
 * Requirements: 2.1
 * 
 * @param gameState - The current game state
 * @param playerId - The ID of the player selecting cards
 * @param cards - The cards to select for passing
 * @returns Updated game state with selected cards
 */
export function selectCardsForPassing(
  gameState: GameState,
  playerId: string,
  cards: Card[]
): GameState {
  // Validate selection
  if (!validatePassingSelection(cards)) {
    throw new Error('Must select exactly 3 cards for passing');
  }

  // Find the player
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  // Validate cards are in hand
  if (!validateCardsInHand(cards, player.hand)) {
    throw new Error('Selected cards are not in player hand');
  }

  // Update selected cards
  const newSelectedCards = new Map(gameState.selectedCardsForPassing);
  newSelectedCards.set(playerId, cards);

  return {
    ...gameState,
    selectedCardsForPassing: newSelectedCards
  };
}

/**
 * Checks if all players have selected their cards for passing
 * Requirements: 2.1
 */
export function allPlayersHaveSelected(gameState: GameState): boolean {
  return gameState.players.every(player =>
    gameState.selectedCardsForPassing.has(player.id) &&
    validatePassingSelection(gameState.selectedCardsForPassing.get(player.id)!)
  );
}
