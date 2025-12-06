import './Rules.css';

interface RulesProps {
  onClose: () => void;
}

/**
 * Rules component - Displays game rules in a modal
 */
export function Rules({ onClose }: RulesProps) {
  return (
    <div className="rules-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rules-header">
          <h2 className="rules-title">Hearts - Game Rules</h2>
          <button className="rules-close" onClick={onClose} aria-label="Close rules">
            ✕
          </button>
        </div>

        <div className="rules-content">
          <section className="rules-section">
            <h3>Objective</h3>
            <p>Avoid taking penalty cards. The player with the lowest score when someone reaches 100 points wins.</p>
          </section>

          <section className="rules-section">
            <h3>Card Values</h3>
            <ul>
              <li><strong>Hearts:</strong> 1 point each (13 total)</li>
              <li><strong>Queen of Spades:</strong> 13 points</li>
              <li><strong>All other cards:</strong> 0 points</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Passing Cards</h3>
            <p>Before each hand, players pass 3 cards to another player:</p>
            <ul>
              <li><strong>Hand 1:</strong> Pass left</li>
              <li><strong>Hand 2:</strong> Pass right</li>
              <li><strong>Hand 3:</strong> Pass across</li>
              <li><strong>Hand 4:</strong> No passing</li>
              <li>Then the cycle repeats</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Playing Cards</h3>
            <ul>
              <li>The player with the <strong>2 of Clubs</strong> leads the first trick</li>
              <li>Players must <strong>follow suit</strong> if they can</li>
              <li>If you can't follow suit, you may play any card</li>
              <li>The highest card of the led suit wins the trick</li>
              <li>The trick winner leads the next trick</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>First Trick Rules</h3>
            <ul>
              <li>The 2 of Clubs must be played to start</li>
              <li><strong>No penalty cards</strong> (Hearts or Queen of Spades) can be played on the first trick</li>
              <li>Exception: If you only have penalty cards, you may play them</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Hearts Breaking</h3>
            <ul>
              <li>Hearts cannot be led until Hearts have been "broken"</li>
              <li>Hearts are broken when a Heart is played on a trick (discarded off-suit)</li>
              <li>Exception: If you only have Hearts, you may lead them</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Shooting the Moon</h3>
            <p>If a player takes <strong>all 26 penalty points</strong> (all Hearts and the Queen of Spades), they score <strong>-26 points</strong> instead of +26.</p>
          </section>

          <section className="rules-section">
            <h3>Winning</h3>
            <p>The game ends when any player reaches <strong>100 points or more</strong>. The player with the <strong>lowest total score</strong> wins!</p>
          </section>
        </div>

        <div className="rules-footer">
          <button className="rules-button" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
