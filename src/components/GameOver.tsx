import type { Player } from '../models';
import './GameOver.css';

interface GameOverProps {
  players: Player[];
  onNewGame: () => void;
}

/**
 * GameOver component - Displays final scores and winner
 * Requirements: 7.3
 */
export function GameOver({ players, onNewGame }: GameOverProps) {
  // Sort players by total score (lowest wins)
  const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
  const winner = sortedPlayers[0];

  return (
    <div className="game-over">
      <div className="game-over__backdrop" onClick={onNewGame} />
      <div className="game-over__modal">
        <h2 className="game-over__title">Game Over!</h2>
        
        <div className="game-over__winner">
          <span className="game-over__trophy">🏆</span>
          <span className="game-over__winner-name">
            {winner.isHuman ? 'You Win!' : `${winner.name} Wins!`}
          </span>
        </div>

        <div className="game-over__scores">
          <h3 className="game-over__scores-title">Final Scores</h3>
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`game-over__score ${index === 0 ? 'game-over__score--winner' : ''}`}
            >
              <span className="game-over__rank">
                {index === 0 ? '🏆' : `${index + 1}.`}
              </span>
              <span className="game-over__name">{player.name}</span>
              <span className="game-over__points">{player.totalScore} points</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onNewGame} 
          className="game-over__button"
          aria-label="Start a new game"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
