import type { Card as CardType } from '../models';
import './CardComponent.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * CardComponent displays a playing card with suit and rank
 * Requirements: 9.1, 9.2, 9.3
 */
export function CardComponent({ card, onClick, selected = false, disabled = false, size = 'medium' }: CardProps) {
  const getSuitSymbol = (suit: string): string => {
    const symbols: Record<string, string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[suit] || '';
  };

  const getSuitColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`card card--${size} card--${getSuitColor(card.suit)} ${selected ? 'card--selected' : ''} ${disabled ? 'card--disabled' : ''} ${onClick && !disabled ? 'card--clickable' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <div className="card__rank">{card.rank}</div>
      <div className="card__suit">{getSuitSymbol(card.suit)}</div>
    </div>
  );
}
