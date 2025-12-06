import { useState, useEffect } from 'react';
import type { Card as CardType, PassingDirection } from '../models';
import { PlayerHand } from './PlayerHand';
import './PassingInterface.css';

interface PassingInterfaceProps {
  cards: CardType[];
  passingDirection: PassingDirection;
  onConfirmPassing: (selectedCards: CardType[]) => void;
  onSelectionChange?: (count: number) => void;
  disabled?: boolean;
}

/**
 * PassingInterface component for selecting cards to pass
 * Requirements: 2.1, 9.2
 */
export function PassingInterface({
  cards,
  passingDirection,
  onConfirmPassing,
  onSelectionChange,
  disabled = false
}: PassingInterfaceProps) {
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

  // Reset selection when cards change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCards([]);
    onSelectionChange?.(0);
  }, [cards, onSelectionChange]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedCards.length);
  }, [selectedCards.length, onSelectionChange]);

  const handleCardClick = (card: CardType) => {
    if (disabled) return;

    setSelectedCards((prev) => {
      const isSelected = prev.some((c) => c.suit === card.suit && c.rank === card.rank);
      
      if (isSelected) {
        // Deselect the card
        return prev.filter((c) => !(c.suit === card.suit && c.rank === card.rank));
      } else {
        // Select the card (max 3 cards)
        if (prev.length < 3) {
          return [...prev, card];
        }
        return prev;
      }
    });
  };

  const handleConfirm = () => {
    if (selectedCards.length === 3 && !disabled) {
      onConfirmPassing(selectedCards);
    }
  };

  const getPassingDirectionText = (direction: PassingDirection): string => {
    switch (direction) {
      case 'left':
        return 'Pass 3 cards to the player on your LEFT';
      case 'right':
        return 'Pass 3 cards to the player on your RIGHT';
      case 'across':
        return 'Pass 3 cards to the player ACROSS from you';
      case 'none':
        return 'No passing this hand';
      default:
        return '';
    }
  };

  // If no passing this hand, don't show the interface
  if (passingDirection === 'none') {
    return (
      <div className="passing-interface">
        <div className="passing-interface__header">
          <h2 className="passing-interface__title">Passing Phase</h2>
          <p className="passing-interface__direction">{getPassingDirectionText(passingDirection)}</p>
        </div>
      </div>
    );
  }

  const isConfirmEnabled = selectedCards.length === 3 && !disabled;

  return (
    <div className="passing-interface">
      <div className="passing-interface__hand">
        <PlayerHand
          cards={cards}
          onCardClick={handleCardClick}
          selectedCards={selectedCards}
          label=""
        />
      </div>

      <div className="passing-interface__actions">
        <button
          className="passing-interface__confirm-button"
          onClick={handleConfirm}
          disabled={!isConfirmEnabled}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
}
