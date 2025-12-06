import { describe, it, expect } from 'vitest';
import { initializeGame, initializeNewHand } from './gameInitialization';
import { findPlayerWith2OfClubs, getPassingDirection } from '../models/GameState';

describe('Game Initialization', () => {
  describe('initializeGame', () => {
    it('should create 4 players (1 human, 3 AI)', () => {
      const gameState = initializeGame();
      
      expect(gameState.players).toHaveLength(4);
      
      const humanPlayers = gameState.players.filter(p => p.isHuman);
      const aiPlayers = gameState.players.filter(p => !p.isHuman);
      
      expect(humanPlayers).toHaveLength(1);
      expect(aiPlayers).toHaveLength(3);
    });

    it('should deal 13 cards to each player', () => {
      const gameState = initializeGame();
      
      gameState.players.forEach(player => {
        expect(player.hand).toHaveLength(13);
      });
    });

    it('should set the current player to the one with 2 of clubs', () => {
      const gameState = initializeGame();
      
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const has2OfClubs = currentPlayer.hand.some(
        card => card.suit === 'clubs' && card.rank === '2'
      );
      
      expect(has2OfClubs).toBe(true);
    });

    it('should start in passing phase for hand 1', () => {
      const gameState = initializeGame();
      
      expect(gameState.phase).toBe('passing');
      expect(gameState.handNumber).toBe(1);
      expect(gameState.passingDirection).toBe('left');
    });

    it('should initialize with no tricks played', () => {
      const gameState = initializeGame();
      
      expect(gameState.currentTrick).toHaveLength(0);
      gameState.players.forEach(player => {
        expect(player.tricksTaken).toHaveLength(0);
      });
    });

    it('should initialize with hearts not broken', () => {
      const gameState = initializeGame();
      
      expect(gameState.heartsBroken).toBe(false);
    });
  });

  describe('initializeNewHand', () => {
    it('should increment hand number', () => {
      const firstHand = initializeGame();
      const secondHand = initializeNewHand(firstHand);
      
      expect(secondHand.handNumber).toBe(2);
    });

    it('should rotate dealer', () => {
      const firstHand = initializeGame();
      const secondHand = initializeNewHand(firstHand);
      
      expect(secondHand.dealerIndex).toBe((firstHand.dealerIndex + 1) % 4);
    });

    it('should deal new cards to all players', () => {
      const firstHand = initializeGame();
      const secondHand = initializeNewHand(firstHand);
      
      // Each player should have 13 cards
      secondHand.players.forEach(player => {
        expect(player.hand).toHaveLength(13);
      });
      
      // Cards should be different from first hand
      const firstHandCards = firstHand.players[0].hand.map(c => `${c.rank}${c.suit}`).sort();
      const secondHandCards = secondHand.players[0].hand.map(c => `${c.rank}${c.suit}`).sort();
      
      // Very unlikely to be the same (but technically possible)
      expect(firstHandCards).not.toEqual(secondHandCards);
    });

    it('should reset tricks taken', () => {
      const firstHand = initializeGame();
      // Simulate some tricks taken
      firstHand.players[0].tricksTaken = [[{ suit: 'hearts', rank: '2', value: 2 }]];
      
      const secondHand = initializeNewHand(firstHand);
      
      secondHand.players.forEach(player => {
        expect(player.tricksTaken).toHaveLength(0);
      });
    });

    it('should preserve total scores but reset hand scores', () => {
      const firstHand = initializeGame();
      firstHand.players[0].totalScore = 10;
      firstHand.players[0].score = 5;
      
      const secondHand = initializeNewHand(firstHand);
      
      expect(secondHand.players[0].totalScore).toBe(10);
      expect(secondHand.players[0].score).toBe(0);
    });

    it('should update passing direction according to cycle', () => {
      let gameState = initializeGame();
      expect(gameState.passingDirection).toBe('left');
      
      gameState = initializeNewHand(gameState);
      expect(gameState.passingDirection).toBe('right');
      
      gameState = initializeNewHand(gameState);
      expect(gameState.passingDirection).toBe('across');
      
      gameState = initializeNewHand(gameState);
      expect(gameState.passingDirection).toBe('none');
      
      gameState = initializeNewHand(gameState);
      expect(gameState.passingDirection).toBe('left'); // Cycle repeats
    });

    it('should skip passing phase when direction is none', () => {
      let gameState = initializeGame();
      
      // Advance to hand 4 (no passing)
      gameState = initializeNewHand(gameState);
      gameState = initializeNewHand(gameState);
      gameState = initializeNewHand(gameState);
      
      expect(gameState.passingDirection).toBe('none');
      expect(gameState.phase).toBe('playing');
    });
  });

  describe('findPlayerWith2OfClubs', () => {
    it('should find the player with 2 of clubs', () => {
      const gameState = initializeGame();
      const playerIndex = findPlayerWith2OfClubs(gameState.players);
      
      expect(playerIndex).toBeGreaterThanOrEqual(0);
      expect(playerIndex).toBeLessThan(4);
      
      const player = gameState.players[playerIndex];
      const has2OfClubs = player.hand.some(
        card => card.suit === 'clubs' && card.rank === '2'
      );
      
      expect(has2OfClubs).toBe(true);
    });
  });

  describe('getPassingDirection', () => {
    it('should follow the correct cycle', () => {
      expect(getPassingDirection(1)).toBe('left');
      expect(getPassingDirection(2)).toBe('right');
      expect(getPassingDirection(3)).toBe('across');
      expect(getPassingDirection(4)).toBe('none');
      expect(getPassingDirection(5)).toBe('left');
      expect(getPassingDirection(6)).toBe('right');
    });
  });
});
