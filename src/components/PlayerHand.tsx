import type { Card as CardType } from '../models';
import { CardComponent } from './CardComponent';
import './PlayerHand.css';

interface PlayerHandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  selectedCards?: CardType[];
  disabledCards?: CardType[];
  label?: string;
}

/**
 * PlayerHand component displays a player's hand of cards with selection capability
 * Requirements: 9.1, 9.2, 9.3
 */
export function PlayerHand({ 
  cards, 
  onCardClick, 
  selectedCards = [], 
  disabledCards = [],
  label = 'Your Hand'
}: PlayerHandProps) {
  const isCardSelected = (card: CardType): boolean => {
    return selectedCards.some(c => c.suit === card.suit && c.rank === card.rank);
  };

  const isCardDisabled = (card: CardType): boolean => {
    return disabledCards.some(c => c.suit === card.suit && c.rank === card.rank);
  };

  const handleCardClick = (card: CardType) => {
    if (onCardClick && !isCardDisabled(card)) {
      onCardClick(card);
    }
  };

  // Sort cards by suit and rank for better display
  const sortedCards = [...cards].sort((a, b) => {
    const suitOrder = { clubs: 0, diamonds: 1, spades: 2, hearts: 3 };
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.value - b.value;
  });

  return (
    <div className="player-hand">
      <div className="player-hand__label">{label}</div>
      <div className="player-hand__cards">
        {sortedCards.map((card, index) => (
          <div key={`${card.suit}-${card.rank}-${index}`} className="player-hand__card">
            <CardComponent
              card={card}
              onClick={() => handleCardClick(card)}
              selected={isCardSelected(card)}
              disabled={isCardDisabled(card)}
              size="medium"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
