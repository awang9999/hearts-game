import { describe, it, expect } from 'vitest';
import { 
  determineTrickWinner, 
  isHandComplete, 
  resolveTrick,
  addCardToTrick 
} from './trickResolution';
import { createCard } from '../models/Card';
import type { GameState, PlayedCard } from '../models/GameState';
import { createPlayer } from '../models/GameState';

describe('determineTrickWinner', () => {
  it('should determine winner based on highest card of led suit', () => {
    const trick: PlayedCard[] = [
      { card: createCard('hearts', '5'), playerId: 'player-0' },
      { card: createCard('hearts', '10'), playerId: 'player-1' },
      { card: createCard('hearts', '3'), playerId: 'player-2' },
      { card: createCard('hearts', '7'), playerId: 'player-3' }
    ];

    const winner = determineTrickWinner(trick);
    expect(winner).toBe('player-1'); // 10 of hearts is highest
  });

  it('should ignore off-suit cards when determining winner', () => {
    const trick: PlayedCard[] = [
      { card: createCard('clubs', '5'), playerId: 'player-0' },
      { card: createCard('clubs', '3'), playerId: 'player-1' },
      { card: createCard('spades', 'A'), playerId: 'player-2' }, // High but off-suit
      { card: createCard('clubs', '7'), playerId: 'player-3' }
    ];

    const winner = determineTrickWinner(trick);
    expect(winner).toBe('player-3'); // 7 of clubs is highest of led suit
  });

  it('should handle Ace as highest card', () => {
    const trick: PlayedCard[] = [
      { card: createCard('diamonds', 'K'), playerId: 'player-0' },
      { card: createCard('diamonds', 'A'), playerId: 'player-1' },
      { card: createCard('diamonds', 'Q'), playerId: 'player-2' },
      { card: createCard('diamonds', '2'), playerId: 'player-3' }
    ];

    const winner = determineTrickWinner(trick);
    expect(winner).toBe('player-1'); // Ace is highest
  });

  it('should throw error if trick does not have exactly 4 cards', () => {
    const incompleteTrick: PlayedCard[] = [
      { card: createCard('hearts', '5'), playerId: 'player-0' },
      { card: createCard('hearts', '10'), playerId: 'player-1' }
    ];

    expect(() => determineTrickWinner(incompleteTrick)).toThrow();
  });
});

describe('isHandComplete', () => {
  it('should return true when all 13 tricks have been played', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    // Distribute 13 tricks among players (e.g., 4, 3, 3, 3)
    players[0].tricksTaken = Array(4).fill([]);
    players[1].tricksTaken = Array(3).fill([]);
    players[2].tricksTaken = Array(3).fill([]);
    players[3].tricksTaken = Array(3).fill([]);

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: [],
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    expect(isHandComplete(gameState)).toBe(true);
  });

  it('should return false when fewer than 13 tricks have been played', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    // Only 5 tricks played
    players[0].tricksTaken = Array(2).fill([]);
    players[1].tricksTaken = Array(1).fill([]);
    players[2].tricksTaken = Array(1).fill([]);
    players[3].tricksTaken = Array(1).fill([]);

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: [],
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    expect(isHandComplete(gameState)).toBe(false);
  });

  it('should return false when no tricks have been played', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: [],
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    expect(isHandComplete(gameState)).toBe(false);
  });
});

describe('resolveTrick', () => {
  it('should award trick to winner and set them as next player', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    const trick: PlayedCard[] = [
      { card: createCard('clubs', '5'), playerId: 'p0' },
      { card: createCard('clubs', '10'), playerId: 'p1' },
      { card: createCard('clubs', '3'), playerId: 'p2' },
      { card: createCard('clubs', '7'), playerId: 'p3' }
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: trick,
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    const result = resolveTrick(gameState);

    // Player 1 (p1) should win with 10 of clubs
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.players[1].tricksTaken.length).toBe(1);
    expect(result.players[1].tricksTaken[0].length).toBe(4);
    expect(result.currentTrick.length).toBe(0); // Trick should be cleared
  });

  it('should set phase to handComplete when 13 tricks are done', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    // 12 tricks already played
    players[0].tricksTaken = Array(3).fill([createCard('hearts', '2')]);
    players[1].tricksTaken = Array(3).fill([createCard('hearts', '3')]);
    players[2].tricksTaken = Array(3).fill([createCard('hearts', '4')]);
    players[3].tricksTaken = Array(3).fill([createCard('hearts', '5')]);

    const trick: PlayedCard[] = [
      { card: createCard('clubs', '5'), playerId: 'p0' },
      { card: createCard('clubs', '10'), playerId: 'p1' },
      { card: createCard('clubs', '3'), playerId: 'p2' },
      { card: createCard('clubs', '7'), playerId: 'p3' }
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: trick,
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    const result = resolveTrick(gameState);

    expect(result.phase).toBe('handComplete');
  });

  it('should break hearts if a heart is played off-suit', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    const trick: PlayedCard[] = [
      { card: createCard('clubs', '5'), playerId: 'p0' },
      { card: createCard('clubs', '10'), playerId: 'p1' },
      { card: createCard('hearts', 'A'), playerId: 'p2' }, // Heart played off-suit
      { card: createCard('clubs', '7'), playerId: 'p3' }
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: trick,
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    const result = resolveTrick(gameState);

    expect(result.heartsBroken).toBe(true);
  });

  it('should throw error if trick is not complete', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    const incompleteTrick: PlayedCard[] = [
      { card: createCard('clubs', '5'), playerId: 'p0' },
      { card: createCard('clubs', '10'), playerId: 'p1' }
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: incompleteTrick,
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    expect(() => resolveTrick(gameState)).toThrow();
  });
});

describe('addCardToTrick', () => {
  it('should add card to current trick', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: [],
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    const card = createCard('clubs', '5');
    const result = addCardToTrick(gameState, card, 'p0');

    expect(result.currentTrick.length).toBe(1);
    expect(result.currentTrick[0].card).toEqual(card);
    expect(result.currentTrick[0].playerId).toBe('p0');
  });

  it('should break hearts when heart is played off-suit', () => {
    const players = [
      createPlayer('p0', 'P0', true),
      createPlayer('p1', 'P1', false),
      createPlayer('p2', 'P2', false),
      createPlayer('p3', 'P3', false)
    ];

    const gameState: GameState = {
      players,
      currentPlayerIndex: 1,
      dealerIndex: 0,
      phase: 'playing',
      passingDirection: 'left',
      handNumber: 1,
      currentTrick: [
        { card: createCard('clubs', '5'), playerId: 'p0' }
      ],
      heartsBroken: false,
      selectedCardsForPassing: new Map()
    };

    const heartCard = createCard('hearts', 'A');
    const result = addCardToTrick(gameState, heartCard, 'p1');

    expect(result.heartsBroken).toBe(true);
  });
});
