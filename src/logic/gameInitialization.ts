import { createDeck, shuffle, deal } from '../models/Deck';
import type { GameState, Player } from '../models/GameState';
import { 
  createPlayer, 
  findPlayerWith2OfClubs,
  getPassingDirection 
} from '../models/GameState';

/**
 * Initializes a new game with 4 players (1 human, 3 AI)
 * Requirements: 1.1, 3.1
 */
export function initializeGame(): GameState {
  // Create 4 players: 1 human and 3 AI
  const players: Player[] = [
    createPlayer('player-0', 'You', true),
    createPlayer('player-1', 'Alice AI', false),
    createPlayer('player-2', 'Bob AI', false),
    createPlayer('player-3', 'Charlie AI', false)
  ];

  // Create, shuffle, and deal the deck
  const deck = createDeck();
  const shuffledDeck = shuffle(deck);
  const hands = deal(shuffledDeck);

  // Assign hands to players
  players.forEach((player, index) => {
    player.hand = hands[index];
  });

  // Find the player with 2 of clubs (they start the first trick)
  const startingPlayerIndex = findPlayerWith2OfClubs(players);

  // Initialize game state
  const gameState: GameState = {
    players,
    currentPlayerIndex: startingPlayerIndex,
    dealerIndex: 0, // First hand, dealer is player 0
    phase: 'passing',
    passingDirection: getPassingDirection(1), // First hand
    handNumber: 1,
    currentTrick: [],
    heartsBroken: false,
    selectedCardsForPassing: new Map()
  };

  return gameState;
}

/**
 * Initializes a new hand (after the first hand)
 * Requirements: 1.1, 3.1
 */
export function initializeNewHand(previousState: GameState): GameState {
  const handNumber = previousState.handNumber + 1;
  
  // Create, shuffle, and deal a new deck
  const deck = createDeck();
  const shuffledDeck = shuffle(deck);
  const hands = deal(shuffledDeck);

  // Reset player hands and hand-specific data
  const players = previousState.players.map((player, index) => ({
    ...player,
    hand: hands[index],
    tricksTaken: [],
    score: 0 // Reset hand score, keep totalScore
  }));

  // Find the player with 2 of clubs
  const startingPlayerIndex = findPlayerWith2OfClubs(players);

  // Determine passing direction for this hand
  const passingDirection = getPassingDirection(handNumber);

  // Create new game state for the new hand
  const gameState: GameState = {
    players,
    currentPlayerIndex: startingPlayerIndex,
    dealerIndex: (previousState.dealerIndex + 1) % 4, // Rotate dealer
    phase: passingDirection === 'none' ? 'playing' : 'passing',
    passingDirection,
    handNumber,
    currentTrick: [],
    heartsBroken: false,
    selectedCardsForPassing: new Map()
  };

  return gameState;
}
