import { useEffect } from 'react';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShowRules: () => void;
  onNewGame: () => void;
  onNewHand: () => void;
  fastMode: boolean;
  onToggleFastMode: (enabled: boolean) => void;
  phase: 'passing' | 'playing' | 'handComplete' | 'gameOver';
}

/**
 * MobileMenu component - Hamburger menu for mobile devices
 */
export function MobileMenu({
  isOpen,
  onClose,
  onShowRules,
  onNewGame,
  onNewHand,
  fastMode,
  onToggleFastMode,
  phase,
}: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose} />
      <div className="mobile-menu">
        <div className="mobile-menu__header">
          <h2 className="mobile-menu__title">Menu</h2>
          <button
            className="mobile-menu__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-menu__content">
          <button className="mobile-menu__item" onClick={() => { onShowRules(); onClose(); }}>
            <span className="mobile-menu__icon">📖</span>
            <span>Rules</span>
          </button>

          <div className="mobile-menu__item mobile-menu__item--toggle">
            <span className="mobile-menu__icon">⚡</span>
            <span>Fast Mode</span>
            <label className="mobile-menu__switch">
              <input
                type="checkbox"
                checked={fastMode}
                onChange={(e) => onToggleFastMode(e.target.checked)}
              />
              <span className="mobile-menu__slider"></span>
            </label>
          </div>

          <div className="mobile-menu__divider"></div>

          <button className="mobile-menu__item" onClick={() => { onNewGame(); onClose(); }}>
            <span className="mobile-menu__icon">🎮</span>
            <span>New Game</span>
          </button>

          {phase === 'handComplete' && (
            <button className="mobile-menu__item" onClick={() => { onNewHand(); onClose(); }}>
              <span className="mobile-menu__icon">🃏</span>
              <span>New Hand</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
