import './GameControls.css';

interface GameControlsProps {
  phase: 'passing' | 'playing' | 'handComplete' | 'gameOver';
  onNewGame: () => void;
  onNewHand: () => void;
}

/**
 * GameControls component - Provides game control buttons
 * Requirements: 7.3
 */
export function GameControls({ phase, onNewGame, onNewHand }: GameControlsProps) {
  return (
    <div className="game-controls">
      <button 
        onClick={onNewGame} 
        className="game-controls__button"
        aria-label="Start a new game"
      >
        New Game
      </button>
      
      {/* Show New Hand button during handComplete phase for testing/debugging */}
      {phase === 'handComplete' && (
        <button 
          onClick={onNewHand} 
          className="game-controls__button game-controls__button--primary"
          aria-label="Start a new hand"
        >
          New Hand
        </button>
      )}
    </div>
  );
}
