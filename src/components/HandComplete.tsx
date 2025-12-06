import type { Player } from '../models';
import './HandComplete.css';

interface HandCompleteProps {
  players: Player[];
  onNewHand: () => void;
}

/**
 * HandComplete component - Displays hand scores after a hand completes
 * Requirements: 7.3
 */
export function HandComplete({ players, onNewHand }: HandCompleteProps) {
  // Check if anyone shot the moon (has 26 points this hand)
  const moonShooter = players.find(p => p.score === 26);
  const hasShootTheMoon = moonShooter !== undefined;

  return (
    <div className="hand-complete">
      <div className="hand-complete__backdrop" onClick={onNewHand} />
      <div className="hand-complete__modal">
        <h2 className="hand-complete__title">Hand Complete!</h2>

        {hasShootTheMoon && (
          <div className="hand-complete__moon">
            <span className="hand-complete__moon-icon">🌙</span>
            <span className="hand-complete__moon-text">
              {moonShooter.name} shot the moon!
            </span>
          </div>
        )}

        <div className="hand-complete__scores">
          <h3 className="hand-complete__scores-title">Hand Scores</h3>
          {players.map(player => (
            <div 
              key={player.id} 
              className={`hand-complete__score ${player.score === 26 ? 'hand-complete__score--moon' : ''}`}
            >
              <span className="hand-complete__name">{player.name}</span>
              <span className="hand-complete__points">
                {player.score > 0 ? '+' : ''}{player.score} points
              </span>
            </div>
          ))}
        </div>

        <div className="hand-complete__totals">
          <h3 className="hand-complete__totals-title">Total Scores</h3>
          {[...players]
            .sort((a, b) => a.totalScore - b.totalScore)
            .map((player, index) => (
              <div key={player.id} className="hand-complete__total">
                <span className="hand-complete__rank">{index + 1}.</span>
                <span className="hand-complete__name">{player.name}</span>
                <span className="hand-complete__total-points">{player.totalScore}</span>
              </div>
            ))}
        </div>

        <button 
          onClick={onNewHand} 
          className="hand-complete__button"
          aria-label="Start next hand"
        >
          Next Hand
        </button>
      </div>
    </div>
  );
}
