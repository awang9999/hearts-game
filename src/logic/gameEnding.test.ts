import { describe, it, expect } from 'vitest';
import { shouldGameEnd, determineWinner, transitionToGameOver, checkAndTransitionToGameOver } from './gameEnding';
import { createPlayer } from '../models/GameState';
import type { GameState } from '../models/GameState';

describe('Game Ending Logic', () => {
  describe('shouldGameEnd', () => {
    it('should return true when a player has exactly 100 points', () => {
      const players = [
        { ...createPlayer('p1', 'Player 1', true), totalScore: 100 },
        { ...createPlayer('p2', 'Player 2', false), totalScore: 50 },
        { ...createPlayer('p3', 'Player 3', false), totalScore: 30 },
        { ...createPlayer('p4', 'Player 4', false), totalScore: 20 }
      ];
      
      expect(shouldGameEnd(players)).toBe(true);
    });

    it('should return true when a player has more than 100 points', () => {
      const players = [
        { ...createPlayer('p1', 'Player 1', true), totalScore: 85 },
        { ...createPlayer('p2', 'Player 2', false), totalScore: 120 },
        { ...createPlayer('p3', 'Player 3', false), totalScore: 45 },
        { ...createPlayer('p4', 'Player 4', false), totalScore: 60 }
      ];
      
      expect(shouldGameEnd(players)).toBe(true);
    });

    it('should return false when all players are below 100 points', () => {
      const players = [
        { ...createPlayer('p1', 'Player 1', true), totalScore: 85 },
        { ...createPlayer('p2', 'Player 2', false), totalScore: 99 },
        { ...createPlayer('p3', 'Player 3', false), totalScore: 45 },
        { ...createPlayer('p4', 'Player 4', false), totalScore: 60 }
      ];
      
      expect(shouldGameEnd(players)).toBe(false);
    });

    it('should return false when all players have 0 points', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      
      expect(shouldGameEnd(players)).toBe(false);
    });
  });

  describe('determineWinner', () => {
    it('should return the player with the lowest score', () => {
      const players = [
        { ...createPlayer('p1', 'Player 1', true), totalScore: 85 },
        { ...createPlayer('p2', 'Player 2', false), totalScore: 120 },
        { ...createPlayer('p3', 'Player 3', false), totalScore: 45 },
        { ...createPlayer('p4', 'Player 4', false), totalScore: 60 }
      ];
      
      expect(determineWinner(players)).toBe('p3');
    });

    it('should return the first player when all have the same score', () => {
      const players = [
        { ...createPlayer('p1', 'Player 1', true), totalScore: 50 },
        { ...createPlayer('p2', 'Player 2', false), totalScore: 50 },
        { ...createPlayer('p3', 'Player 3', false), totalScore: 50 },
        { ...createPlayer('p4', 'Player 4', false), totalScore: 50 }
      ];
      
      expect(determineWinner(players)).toBe('p1');
    });

    it('should handle negative scores from shooting the moon', () => {
      const players = [
        { ...createPlayer('p1', 'Player 1', true), totalScore: -10 },
        { ...createPlayer('p2', 'Player 2', false), totalScore: 120 },
        { ...createPlayer('p3', 'Player 3', false), totalScore: 45 },
        { ...createPlayer('p4', 'Player 4', false), totalScore: 60 }
      ];
      
      expect(determineWinner(players)).toBe('p1');
    });

    it('should throw error when no players exist', () => {
      expect(() => determineWinner([])).toThrow('Cannot determine winner with no players');
    });
  });

  describe('transitionToGameOver', () => {
    it('should set phase to gameOver', () => {
      const gameState: GameState = {
        players: [
          { ...createPlayer('p1', 'Player 1', true), totalScore: 100 },
          { ...createPlayer('p2', 'Player 2', false), totalScore: 50 },
          { ...createPlayer('p3', 'Player 3', false), totalScore: 30 },
          { ...createPlayer('p4', 'Player 4', false), totalScore: 20 }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'handComplete',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };
      
      const result = transitionToGameOver(gameState);
      
      expect(result.phase).toBe('gameOver');
      expect(result.players).toBe(gameState.players);
      expect(result.currentPlayerIndex).toBe(gameState.currentPlayerIndex);
    });

    it('should preserve all other game state properties', () => {
      const gameState: GameState = {
        players: [
          { ...createPlayer('p1', 'Player 1', true), totalScore: 100 },
          { ...createPlayer('p2', 'Player 2', false), totalScore: 50 },
          { ...createPlayer('p3', 'Player 3', false), totalScore: 30 },
          { ...createPlayer('p4', 'Player 4', false), totalScore: 20 }
        ],
        currentPlayerIndex: 2,
        dealerIndex: 1,
        phase: 'handComplete',
        passingDirection: 'right',
        handNumber: 5,
        currentTrick: [],
        heartsBroken: true,
        selectedCardsForPassing: new Map()
      };
      
      const result = transitionToGameOver(gameState);
      
      expect(result.currentPlayerIndex).toBe(2);
      expect(result.dealerIndex).toBe(1);
      expect(result.passingDirection).toBe('right');
      expect(result.handNumber).toBe(5);
      expect(result.heartsBroken).toBe(true);
    });
  });

  describe('checkAndTransitionToGameOver', () => {
    it('should transition to gameOver when a player reaches 100 points', () => {
      const gameState: GameState = {
        players: [
          { ...createPlayer('p1', 'Player 1', true), totalScore: 100 },
          { ...createPlayer('p2', 'Player 2', false), totalScore: 50 },
          { ...createPlayer('p3', 'Player 3', false), totalScore: 30 },
          { ...createPlayer('p4', 'Player 4', false), totalScore: 20 }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'handComplete',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };
      
      const result = checkAndTransitionToGameOver(gameState);
      
      expect(result.phase).toBe('gameOver');
    });

    it('should not transition when all players are below 100 points', () => {
      const gameState: GameState = {
        players: [
          { ...createPlayer('p1', 'Player 1', true), totalScore: 85 },
          { ...createPlayer('p2', 'Player 2', false), totalScore: 99 },
          { ...createPlayer('p3', 'Player 3', false), totalScore: 45 },
          { ...createPlayer('p4', 'Player 4', false), totalScore: 60 }
        ],
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'handComplete',
        passingDirection: 'left',
        handNumber: 1,
        currentTrick: [],
        heartsBroken: false,
        selectedCardsForPassing: new Map()
      };
      
      const result = checkAndTransitionToGameOver(gameState);
      
      expect(result.phase).toBe('handComplete');
      expect(result).toBe(gameState);
    });
  });
});
