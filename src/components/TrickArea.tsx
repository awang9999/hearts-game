import type { PlayedCard } from '../models';
import { CardComponent } from './CardComponent';
import './TrickArea.css';

interface TrickAreaProps {
  trick: PlayedCard[];
  playerNames: string[];
}

/**
 * TrickArea component displays the current trick being played
 * Requirements: 10.1, 10.3
 */
export function TrickArea({ trick, playerNames }: TrickAreaProps) {
  // Position mapping for 4 players: bottom (human), left, top, right
  const getPositionClass = (playerId: string): string => {
    const playerIndex = parseInt(playerId.replace('player', ''));
    const positions = ['bottom', 'left', 'top', 'right'];
    return positions[playerIndex];
  };

  const getPlayerName = (playerId: string): string => {
    const playerIndex = parseInt(playerId.replace('player', ''));
    return playerNames[playerIndex] || `Player ${playerIndex + 1}`;
  };

  return (
    <div className="trick-area">
      <div className="trick-area__title">Current Trick</div>
      <div className="trick-area__cards">
        {trick.length === 0 ? (
          <div className="trick-area__empty">Waiting for cards...</div>
        ) : (
          trick.map((playedCard, index) => (
            <div 
              key={`${playedCard.playerId}-${index}`}
              className={`trick-area__card trick-area__card--${getPositionClass(playedCard.playerId)}`}
            >
              <div className="trick-area__player-name">
                {getPlayerName(playedCard.playerId)}
              </div>
              <CardComponent card={playedCard.card} size="medium" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
