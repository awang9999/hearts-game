import { describe, it, expect } from 'vitest';
import {
  countHearts,
  hasQueenOfSpades,
  calculateHandScore,
  hasShotTheMoon,
  applyShootingTheMoon,
  updateCumulativeScores,
  scoreHand
} from './scoring';
import { createCard } from '../models/Card';
import { createPlayer } from '../models/GameState';

describe('Scoring System', () => {
  describe('countHearts', () => {
    it('should count zero hearts in empty tricks', () => {
      expect(countHearts([])).toBe(0);
    });

    it('should count hearts in a single trick', () => {
      const tricks = [[
        createCard('hearts', '2'),
        createCard('hearts', '5'),
        createCard('clubs', '3'),
        createCard('spades', 'K')
      ]];
      expect(countHearts(tricks)).toBe(2);
    });

    it('should count hearts across multiple tricks', () => {
      const tricks = [
        [
          createCard('hearts', '2'),
          createCard('hearts', '5'),
          createCard('clubs', '3'),
          createCard('spades', 'K')
        ],
        [
          createCard('hearts', 'A'),
          createCard('diamonds', '7'),
          createCard('hearts', 'Q'),
          createCard('hearts', 'K')
        ]
      ];
      expect(countHearts(tricks)).toBe(5);
    });

    it('should count all 13 hearts', () => {
      const allHearts = [
        (['2', '3', '4', '5'] as const).map(r => createCard('hearts', r)),
        (['6', '7', '8', '9'] as const).map(r => createCard('hearts', r)),
        (['10', 'J', 'Q', 'K', 'A'] as const).map(r => createCard('hearts', r))
      ];
      expect(countHearts(allHearts)).toBe(13);
    });
  });

  describe('hasQueenOfSpades', () => {
    it('should return false for empty tricks', () => {
      expect(hasQueenOfSpades([])).toBe(false);
    });

    it('should return false when Queen of Spades is not present', () => {
      const tricks = [[
        createCard('hearts', '2'),
        createCard('spades', 'K'),
        createCard('clubs', '3'),
        createCard('diamonds', 'A')
      ]];
      expect(hasQueenOfSpades(tricks)).toBe(false);
    });

    it('should return true when Queen of Spades is present', () => {
      const tricks = [[
        createCard('hearts', '2'),
        createCard('spades', 'Q'),
        createCard('clubs', '3'),
        createCard('diamonds', 'A')
      ]];
      expect(hasQueenOfSpades(tricks)).toBe(true);
    });

    it('should return true when Queen of Spades is in later trick', () => {
      const tricks = [
        [
          createCard('hearts', '2'),
          createCard('spades', 'K'),
          createCard('clubs', '3'),
          createCard('diamonds', 'A')
        ],
        [
          createCard('spades', 'Q'),
          createCard('hearts', '5'),
          createCard('clubs', '7'),
          createCard('diamonds', '9')
        ]
      ];
      expect(hasQueenOfSpades(tricks)).toBe(true);
    });
  });

  describe('calculateHandScore', () => {
    it('should return 0 for no penalty cards', () => {
      const tricks = [[
        createCard('clubs', '2'),
        createCard('spades', 'K'),
        createCard('diamonds', '3'),
        createCard('clubs', 'A')
      ]];
      expect(calculateHandScore(tricks)).toBe(0);
    });

    it('should count only hearts', () => {
      const tricks = [[
        createCard('hearts', '2'),
        createCard('hearts', '5'),
        createCard('clubs', '3'),
        createCard('spades', 'K')
      ]];
      expect(calculateHandScore(tricks)).toBe(2);
    });

    it('should count only Queen of Spades', () => {
      const tricks = [[
        createCard('spades', 'Q'),
        createCard('clubs', '5'),
        createCard('diamonds', '3'),
        createCard('spades', 'K')
      ]];
      expect(calculateHandScore(tricks)).toBe(13);
    });

    it('should count hearts and Queen of Spades together', () => {
      const tricks = [
        [
          createCard('hearts', '2'),
          createCard('hearts', '5'),
          createCard('clubs', '3'),
          createCard('spades', 'K')
        ],
        [
          createCard('spades', 'Q'),
          createCard('hearts', 'A'),
          createCard('diamonds', '7'),
          createCard('clubs', '9')
        ]
      ];
      expect(calculateHandScore(tricks)).toBe(16); // 3 hearts + 13 for Q♠
    });

    it('should calculate shooting the moon score (26 points)', () => {
      const allPenaltyCards = [
        (['2', '3', '4', '5'] as const).map(r => createCard('hearts', r)),
        (['6', '7', '8', '9'] as const).map(r => createCard('hearts', r)),
        (['10', 'J', 'Q', 'K', 'A'] as const).map(r => createCard('hearts', r)),
        [createCard('spades', 'Q')]
      ];
      expect(calculateHandScore(allPenaltyCards)).toBe(26);
    });
  });

  describe('hasShotTheMoon', () => {
    it('should return true for exactly 26 points', () => {
      expect(hasShotTheMoon(26)).toBe(true);
    });

    it('should return false for less than 26 points', () => {
      expect(hasShotTheMoon(25)).toBe(false);
      expect(hasShotTheMoon(0)).toBe(false);
      expect(hasShotTheMoon(13)).toBe(false);
    });

    it('should return false for more than 26 points', () => {
      expect(hasShotTheMoon(27)).toBe(false);
    });
  });

  describe('applyShootingTheMoon', () => {
    it('should not modify scores when no one shot the moon', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      players[0].score = 10;
      players[1].score = 8;
      players[2].score = 5;
      players[3].score = 3;

      applyShootingTheMoon(players);

      expect(players[0].score).toBe(10);
      expect(players[1].score).toBe(8);
      expect(players[2].score).toBe(5);
      expect(players[3].score).toBe(3);
    });

    it('should subtract 26 from shooter when someone shoots the moon', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      players[0].score = 26; // Shot the moon
      players[1].score = 0;
      players[2].score = 0;
      players[3].score = 0;

      applyShootingTheMoon(players);

      expect(players[0].score).toBe(-26);
      expect(players[1].score).toBe(0);
      expect(players[2].score).toBe(0);
      expect(players[3].score).toBe(0);
    });

    it('should handle when second player shoots the moon', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      players[0].score = 0;
      players[1].score = 26; // Shot the moon
      players[2].score = 0;
      players[3].score = 0;

      applyShootingTheMoon(players);

      expect(players[0].score).toBe(0);
      expect(players[1].score).toBe(-26);
      expect(players[2].score).toBe(0);
      expect(players[3].score).toBe(0);
    });
  });

  describe('updateCumulativeScores', () => {
    it('should add hand scores to total scores', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      players[0].score = 10;
      players[0].totalScore = 20;
      players[1].score = 5;
      players[1].totalScore = 15;
      players[2].score = 8;
      players[2].totalScore = 30;
      players[3].score = 3;
      players[3].totalScore = 25;

      updateCumulativeScores(players);

      expect(players[0].totalScore).toBe(30);
      expect(players[1].totalScore).toBe(20);
      expect(players[2].totalScore).toBe(38);
      expect(players[3].totalScore).toBe(28);
    });

    it('should handle negative scores from shooting the moon', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      players[0].score = -26; // Shot the moon
      players[0].totalScore = 50;
      players[1].score = 0;
      players[1].totalScore = 40;
      players[2].score = 0;
      players[2].totalScore = 35;
      players[3].score = 0;
      players[3].totalScore = 45;

      updateCumulativeScores(players);

      expect(players[0].totalScore).toBe(24);
      expect(players[1].totalScore).toBe(40);
      expect(players[2].totalScore).toBe(35);
      expect(players[3].totalScore).toBe(45);
    });

    it('should handle zero scores', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];
      players[0].score = 0;
      players[0].totalScore = 0;
      players[1].score = 0;
      players[1].totalScore = 0;
      players[2].score = 0;
      players[2].totalScore = 0;
      players[3].score = 0;
      players[3].totalScore = 0;

      updateCumulativeScores(players);

      expect(players[0].totalScore).toBe(0);
      expect(players[1].totalScore).toBe(0);
      expect(players[2].totalScore).toBe(0);
      expect(players[3].totalScore).toBe(0);
    });
  });

  describe('scoreHand', () => {
    it('should calculate and apply scores for a normal hand', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];

      // Player 1 took 3 hearts
      players[0].tricksTaken = [
        [createCard('hearts', '2'), createCard('clubs', '3'), createCard('diamonds', '4'), createCard('spades', '5')],
        [createCard('hearts', '6'), createCard('clubs', '7'), createCard('diamonds', '8'), createCard('spades', '9')],
        [createCard('hearts', '10'), createCard('clubs', 'J'), createCard('diamonds', 'Q'), createCard('spades', 'K')]
      ];
      players[0].totalScore = 10;

      // Player 2 took Queen of Spades
      players[1].tricksTaken = [
        [createCard('spades', 'Q'), createCard('clubs', '2'), createCard('diamonds', '3'), createCard('spades', '4')]
      ];
      players[1].totalScore = 20;

      // Player 3 took 5 hearts
      players[2].tricksTaken = [
        [createCard('hearts', 'J'), createCard('hearts', 'Q'), createCard('hearts', 'K'), createCard('hearts', 'A')],
        [createCard('hearts', '3'), createCard('clubs', '4'), createCard('diamonds', '5'), createCard('spades', '6')]
      ];
      players[2].totalScore = 15;

      // Player 4 took no penalty cards
      players[3].tricksTaken = [
        [createCard('clubs', 'A'), createCard('clubs', 'K'), createCard('diamonds', 'A'), createCard('spades', 'A')]
      ];
      players[3].totalScore = 5;

      scoreHand(players);

      expect(players[0].score).toBe(3);
      expect(players[0].totalScore).toBe(13);
      expect(players[1].score).toBe(13);
      expect(players[1].totalScore).toBe(33);
      expect(players[2].score).toBe(5);
      expect(players[2].totalScore).toBe(20);
      expect(players[3].score).toBe(0);
      expect(players[3].totalScore).toBe(5);
    });

    it('should handle shooting the moon correctly', () => {
      const players = [
        createPlayer('p1', 'Player 1', true),
        createPlayer('p2', 'Player 2', false),
        createPlayer('p3', 'Player 3', false),
        createPlayer('p4', 'Player 4', false)
      ];

      // Player 1 shot the moon (all 13 hearts + Q♠)
      players[0].tricksTaken = [
        (['2', '3', '4', '5'] as const).map(r => createCard('hearts', r)),
        (['6', '7', '8', '9'] as const).map(r => createCard('hearts', r)),
        (['10', 'J', 'Q', 'K', 'A'] as const).map(r => createCard('hearts', r)),
        [createCard('spades', 'Q'), createCard('clubs', '2'), createCard('diamonds', '3'), createCard('spades', '4')]
      ];
      players[0].totalScore = 30;

      // Other players took no penalty cards
      players[1].tricksTaken = [];
      players[1].totalScore = 40;
      players[2].tricksTaken = [];
      players[2].totalScore = 35;
      players[3].tricksTaken = [];
      players[3].totalScore = 45;

      scoreHand(players);

      expect(players[0].score).toBe(-26);
      expect(players[0].totalScore).toBe(4); // 30 - 26
      expect(players[1].score).toBe(0);
      expect(players[1].totalScore).toBe(40);
      expect(players[2].score).toBe(0);
      expect(players[2].totalScore).toBe(35);
      expect(players[3].score).toBe(0);
      expect(players[3].totalScore).toBe(45);
    });
  });
});
