import type { Player, Card } from '../models';
import './ScoreBoard.css';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
}

/**
 * Calculate current hand score from tricks taken
 */
function calculateCurrentHandScore(tricksTaken: Card[][]): number {
  let score = 0;
  
  for (const trick of tricksTaken) {
    for (const card of trick) {
      // Hearts are worth 1 point each
      if (card.suit === 'hearts') {
        score += 1;
      }
      // Queen of Spades is worth 13 points
      if (card.suit === 'spades' && card.rank === 'Q') {
        score += 13;
      }
    }
  }
  
  return score;
}

/**
 * ScoreBoard component displays all player scores
 * Requirements: 10.2
 */
export function ScoreBoard({ players, currentPlayerIndex }: ScoreBoardProps) {
  return (
    <div className="scoreboard">
      <div className="scoreboard__title">Scores</div>
      <div className="scoreboard__players">
        {players.map((player, index) => {
          // Calculate current hand score from tricks taken
          const currentHandScore = calculateCurrentHandScore(player.tricksTaken);
          
          return (
            <div 
              key={player.id}
              className={`scoreboard__player ${index === currentPlayerIndex ? 'scoreboard__player--active' : ''}`}
            >
              <div className="scoreboard__player-name">
                {player.name}
                {player.isHuman && ' (You)'}
              </div>
              <div className="scoreboard__scores">
                <div className="scoreboard__score">
                  <span className="scoreboard__score-label">Hand:</span>
                  <span className="scoreboard__score-value">{currentHandScore}</span>
                </div>
                <div className="scoreboard__score scoreboard__score--total">
                  <span className="scoreboard__score-label">Total:</span>
                  <span className="scoreboard__score-value">{player.totalScore}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
