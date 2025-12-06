import type { Player, Card } from '../models';
import './OpponentDisplay.css';

interface OpponentDisplayProps {
  player: Player;
  position: 'left' | 'top' | 'right';
  isActive: boolean;
  isThinking?: boolean;
}

/**
 * Calculate current hand score from tricks taken
 */
function calculateCurrentHandScore(tricksTaken: Card[][]): number {
  let score = 0;
  
  for (const trick of tricksTaken) {
    for (const card of trick) {
      if (card.suit === 'hearts') {
        score += 1;
      }
      if (card.suit === 'spades' && card.rank === 'Q') {
        score += 13;
      }
    }
  }
  
  return score;
}

/**
 * OpponentDisplay component shows an AI opponent's information
 * Requirements: 8.3, 9.1, 9.3, 10.3
 */
export function OpponentDisplay({ player, position, isActive, isThinking = false }: OpponentDisplayProps) {
  const currentHandScore = calculateCurrentHandScore(player.tricksTaken);
  
  return (
    <div className={`opponent opponent--${position} ${isActive ? 'opponent--active' : ''} ${isThinking ? 'opponent--thinking' : ''}`}>
      <div className="opponent__info">
        <div className="opponent__name">
          {player.name}
          {isThinking && <span className="opponent__thinking-badge">💭</span>}
        </div>
        <div className="opponent__stats">
          <div className="opponent__stat">
            <span className="opponent__stat-label">Tricks:</span>
            <span className="opponent__stat-value">{player.tricksTaken.length}</span>
          </div>
          <div className="opponent__stat">
            <span className="opponent__stat-label">Hand:</span>
            <span className="opponent__stat-value">{currentHandScore}</span>
          </div>
          <div className="opponent__stat opponent__stat--total">
            <span className="opponent__stat-label">Total:</span>
            <span className="opponent__stat-value">{player.totalScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
