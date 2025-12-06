import { useEffect, useState, useRef } from 'react';
import type { Card as CardType } from '../models';
import { CardComponent } from './CardComponent';
import { PlayerHand } from './PlayerHand';
import { OpponentDisplay } from './OpponentDisplay';
import { PassingInterface } from './PassingInterface';
import { GameControls } from './GameControls';
import { GameOver } from './GameOver';
import { HandComplete } from './HandComplete';
import { Rules } from './Rules';
import { useGame } from '../hooks/useGame';
import { getValidPlays } from '../logic/moveValidation';
import { determineTrickWinner } from '../logic/trickResolution';
import './GameBoard.css';

/**
 * Calculate current hand score from tricks taken
 */
function calculateCurrentHandScore(tricksTaken: CardType[][]): number {
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
 * GameBoard component - Main game interface
 * Requirements: 3.2, 9.2, 10.3, 10.4, 10.5
 */
export function GameBoard() {
  const {
    gameState,
    error,
    isProcessingAI,
    startNewGame,
    startNewHand,
    selectPassingCards,
    playCard,
    loadSavedGame
  } = useGame();

  const [trickWinner, setTrickWinner] = useState<string | null>(null);
  const [showingTrickResult, setShowingTrickResult] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [selectedPassingCount, setSelectedPassingCount] = useState(0);
  const previousTrickLength = useRef(0);

  // Load saved game and settings on mount
  useEffect(() => {
    const loaded = loadSavedGame();
    if (!loaded) {
      startNewGame();
    }
    
    // Load fast mode setting
    try {
      const savedFastMode = localStorage.getItem('hearts-fast-mode');
      if (savedFastMode) {
        setFastMode(JSON.parse(savedFastMode));
      }
    } catch (e) {
      // localStorage not available (e.g., in tests)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle trick completion animation - Requirements: 10.5
  useEffect(() => {
    if (!gameState) return;

    const currentTrickLength = gameState.currentTrick.length;

    // Clear winner message when new trick starts
    if (currentTrickLength === 1 && previousTrickLength.current === 0) {
      setShowingTrickResult(false);
      setTrickWinner(null);
    }

    // Detect when trick completes (goes from 3 to 4 cards)
    if (currentTrickLength === 4 && previousTrickLength.current === 3) {
      // Determine the winner before the trick is resolved
      const winnerId = determineTrickWinner(gameState.currentTrick);
      const winner = gameState.players.find(p => p.id === winnerId);
      
      if (winner) {
        setTrickWinner(winner.name);
        setShowingTrickResult(true);

        // Clear the winner message after 2 seconds
        const timer = setTimeout(() => {
          setShowingTrickResult(false);
          setTrickWinner(null);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }

    previousTrickLength.current = currentTrickLength;
  }, [gameState, gameState?.currentTrick.length, gameState?.players]);

  if (!gameState) {
    return (
      <div className="game-board">
        <div className="game-board__loading">Loading game...</div>
      </div>
    );
  }

  const humanPlayer = gameState.players.find(p => p.isHuman);
  if (!humanPlayer) {
    return (
      <div className="game-board">
        <div className="game-board__error">Error: No human player found</div>
      </div>
    );
  }

  const aiPlayers = gameState.players.filter(p => !p.isHuman);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.isHuman;

  // Get valid plays for the human player
  const validPlays = gameState.phase === 'playing' && isHumanTurn
    ? getValidPlays(humanPlayer.hand, gameState)
    : [];

  // Get disabled cards (cards that are not valid plays)
  const disabledCards = gameState.phase === 'playing' && isHumanTurn
    ? humanPlayer.hand.filter(card => 
        !validPlays.some(v => v.suit === card.suit && v.rank === card.rank)
      )
    : [];

  const handleCardPlay = (card: CardType) => {
    if (gameState.phase !== 'playing') return;
    if (!isHumanTurn) return;
    
    playCard(humanPlayer.id, card);
  };

  const handleNewGame = () => {
    startNewGame();
  };

  const handleNewHand = () => {
    startNewHand();
  };

  return (
    <div className="game-board">
      {/* Header with game info */}
      <div className="game-board__header">
        <h1 className="game-board__title">Hearts</h1>
        <div className="game-board__header-controls">
          <button 
            className="game-board__rules-button"
            onClick={() => setShowRules(true)}
            aria-label="Show game rules"
          >
            📖 Rules
          </button>
          <label className="game-board__fast-mode-toggle">
            <span className="game-board__fast-mode-label">⚡ Fast Mode</span>
            <input
              type="checkbox"
              checked={fastMode}
              onChange={(e) => {
                const newFastMode = e.target.checked;
                setFastMode(newFastMode);
                try {
                  localStorage.setItem('hearts-fast-mode', JSON.stringify(newFastMode));
                } catch (e) {
                  // localStorage not available
                }
              }}
              className="game-board__fast-mode-checkbox"
              aria-label="Toggle fast mode"
            />
            <span className="game-board__fast-mode-slider"></span>
          </label>
          <GameControls 
            phase={gameState.phase}
            onNewGame={handleNewGame}
            onNewHand={handleNewHand}
          />
        </div>
      </div>

      {/* Game status indicators */}
      <div className="game-board__status">
        {/* Turn indicator - Requirements: 8.3, 10.3 */}
        <div className="game-board__turn-indicator">
          {gameState.phase === 'playing' && (
            <>
              <span className="game-board__status-label">Turn:</span>
              <span className={`game-board__status-value ${isHumanTurn ? 'game-board__status-value--highlight' : ''} ${isProcessingAI && !isHumanTurn ? 'game-board__status-value--thinking' : ''}`}>
                {currentPlayer.name}
                {isProcessingAI && !isHumanTurn && (
                  <>
                    {' '}
                    <span className="game-board__thinking-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </>
                )}
              </span>
            </>
          )}
          {gameState.phase === 'passing' && (
            <>
              <span className="game-board__status-value">Passing Phase</span>
              {isProcessingAI && (
                <span className="game-board__thinking-indicator">
                  (AI selecting cards<span className="game-board__thinking-dots"><span>.</span><span>.</span><span>.</span></span>)
                </span>
              )}
            </>
          )}
          {gameState.phase === 'handComplete' && (
            <span className="game-board__status-value">Hand Complete</span>
          )}
          {gameState.phase === 'gameOver' && (
            <span className="game-board__status-value">Game Over</span>
          )}
        </div>

        {/* Hearts broken indicator - Requirements: 10.4 */}
        {gameState.phase === 'playing' && (
          <div className="game-board__hearts-status">
            <span className="game-board__status-label">Hearts:</span>
            <span className={`game-board__status-value ${gameState.heartsBroken ? 'game-board__status-value--broken' : ''}`}>
              {gameState.heartsBroken ? '💔 Broken' : '❤️ Not Broken'}
            </span>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="game-board__error">
          {error}
        </div>
      )}

      {/* Main game table layout - Requirements: 8.3, 10.1 */}
      <div className="game-board__table">
        {/* Top player */}
        {aiPlayers[1] && (
          <div className="game-board__player game-board__player--top">
            <OpponentDisplay
              player={aiPlayers[1]}
              position="top"
              isActive={gameState.players.findIndex(p => p.id === aiPlayers[1].id) === gameState.currentPlayerIndex}
              isThinking={isProcessingAI && gameState.players.findIndex(p => p.id === aiPlayers[1].id) === gameState.currentPlayerIndex}
            />
          </div>
        )}

        {/* Middle row: Left player, Table surface, Right player */}
        <div className="game-board__middle-row">
          {/* Left player */}
          {aiPlayers[0] && (
            <div className="game-board__player game-board__player--left">
              <OpponentDisplay
                player={aiPlayers[0]}
                position="left"
                isActive={gameState.players.findIndex(p => p.id === aiPlayers[0].id) === gameState.currentPlayerIndex}
                isThinking={isProcessingAI && gameState.players.findIndex(p => p.id === aiPlayers[0].id) === gameState.currentPlayerIndex}
              />
            </div>
          )}

          {/* Central table area with played cards */}
          <div className="game-board__table-surface">
            {/* Top player's card */}
            {aiPlayers[1] && (() => {
              const playedCard = gameState.currentTrick.find(pc => pc.playerId === aiPlayers[1].id);
              const isLeading = playedCard && gameState.currentTrick[0]?.playerId === aiPlayers[1].id;
              return playedCard ? (
                <div className={`game-board__table-card game-board__table-card--top ${isLeading ? 'game-board__table-card--leading' : ''}`}>
                  <CardComponent card={playedCard.card} size="medium" />
                </div>
              ) : null;
            })()}

            {/* Left player's card */}
            {aiPlayers[0] && (() => {
              const playedCard = gameState.currentTrick.find(pc => pc.playerId === aiPlayers[0].id);
              const isLeading = playedCard && gameState.currentTrick[0]?.playerId === aiPlayers[0].id;
              return playedCard ? (
                <div className={`game-board__table-card game-board__table-card--left ${isLeading ? 'game-board__table-card--leading' : ''}`}>
                  <CardComponent card={playedCard.card} size="medium" />
                </div>
              ) : null;
            })()}

            {/* Trick winner message in center */}
            {trickWinner && showingTrickResult && (
              <div className="game-board__trick-winner">
                🏆 {trickWinner === humanPlayer.name ? 'You win!' : `${trickWinner} wins!`}
              </div>
            )}

            {/* Right player's card */}
            {aiPlayers[2] && (() => {
              const playedCard = gameState.currentTrick.find(pc => pc.playerId === aiPlayers[2].id);
              const isLeading = playedCard && gameState.currentTrick[0]?.playerId === aiPlayers[2].id;
              return playedCard ? (
                <div className={`game-board__table-card game-board__table-card--right ${isLeading ? 'game-board__table-card--leading' : ''}`}>
                  <CardComponent card={playedCard.card} size="medium" />
                </div>
              ) : null;
            })()}

            {/* Bottom player's (human) card */}
            {(() => {
              const playedCard = gameState.currentTrick.find(pc => pc.playerId === humanPlayer.id);
              const isLeading = playedCard && gameState.currentTrick[0]?.playerId === humanPlayer.id;
              return playedCard ? (
                <div className={`game-board__table-card game-board__table-card--bottom ${isLeading ? 'game-board__table-card--leading' : ''}`}>
                  <CardComponent card={playedCard.card} size="medium" />
                </div>
              ) : null;
            })()}
          </div>

          {/* Right player */}
          {aiPlayers[2] && (
            <div className="game-board__player game-board__player--right">
              <OpponentDisplay
                player={aiPlayers[2]}
                position="right"
                isActive={gameState.players.findIndex(p => p.id === aiPlayers[2].id) === gameState.currentPlayerIndex}
                isThinking={isProcessingAI && gameState.players.findIndex(p => p.id === aiPlayers[2].id) === gameState.currentPlayerIndex}
              />
            </div>
          )}
        </div>
      </div>

      {/* Passing interface */}
      {gameState.phase === 'passing' && (
        <div className="game-board__passing">
          {/* Top row: Phase message and player stats */}
          <div className="game-board__passing-header">
            <div className="game-board__passing-message">
              {gameState.passingDirection !== 'none' ? (
                <>
                  <div className="game-board__passing-title">Passing Phase</div>
                  <div className="game-board__passing-subtitle">
                    {gameState.passingDirection === 'left' && 'Pass 3 cards LEFT'}
                    {gameState.passingDirection === 'right' && 'Pass 3 cards RIGHT'}
                    {gameState.passingDirection === 'across' && 'Pass 3 cards ACROSS'}
                  </div>
                  <div className="game-board__passing-count">
                    Selected: {selectedPassingCount} / 3
                  </div>
                </>
              ) : (
                <>
                  <div className="game-board__passing-title">No Passing</div>
                  <div className="game-board__passing-subtitle">Game starting soon...</div>
                </>
              )}
            </div>

            {/* Human player stats during passing */}
            <div className="game-board__player-info">
              <div className="game-board__player-name">
                {humanPlayer.name}
              </div>
              <div className="game-board__player-stats">
                <div className="game-board__player-stat">
                  <span className="game-board__player-stat-label">Tricks:</span>
                  <span className="game-board__player-stat-value">{humanPlayer.tricksTaken.length}</span>
                </div>
                <div className="game-board__player-stat">
                  <span className="game-board__player-stat-label">Hand:</span>
                  <span className="game-board__player-stat-value">{calculateCurrentHandScore(humanPlayer.tricksTaken)}</span>
                </div>
                <div className="game-board__player-stat game-board__player-stat--total">
                  <span className="game-board__player-stat-label">Total:</span>
                  <span className="game-board__player-stat-value">{humanPlayer.totalScore}</span>
                </div>
              </div>
            </div>
          </div>

          {isProcessingAI && (
            <div className="game-board__ai-thinking">
              <div className="game-board__ai-thinking-spinner"></div>
              <span>AI players are selecting cards to pass...</span>
            </div>
          )}
          {gameState.passingDirection !== 'none' && (
            <PassingInterface
              cards={humanPlayer.hand}
              passingDirection={gameState.passingDirection}
              onConfirmPassing={(cards) => {
                selectPassingCards(humanPlayer.id, cards);
              }}
              onSelectionChange={setSelectedPassingCount}
              disabled={isProcessingAI}
            />
          )}
        </div>
      )}

      {/* Player hand - Requirements: 3.2, 9.2 */}
      {gameState.phase === 'playing' && (
        <div className="game-board__player-area">
          {/* Human player stats */}
          <div className="game-board__player-info">
            <div className="game-board__player-name">
              {humanPlayer.name}
            </div>
            <div className="game-board__player-stats">
              <div className="game-board__player-stat">
                <span className="game-board__player-stat-label">Tricks:</span>
                <span className="game-board__player-stat-value">{humanPlayer.tricksTaken.length}</span>
              </div>
              <div className="game-board__player-stat">
                <span className="game-board__player-stat-label">Hand:</span>
                <span className="game-board__player-stat-value">{calculateCurrentHandScore(humanPlayer.tricksTaken)}</span>
              </div>
              <div className="game-board__player-stat game-board__player-stat--total">
                <span className="game-board__player-stat-label">Total:</span>
                <span className="game-board__player-stat-value">{humanPlayer.totalScore}</span>
              </div>
            </div>
          </div>

          <div className="game-board__player-hand">
            <PlayerHand
              cards={humanPlayer.hand}
              onCardClick={handleCardPlay}
              selectedCards={[]}
              disabledCards={disabledCards}
              label=""
            />
            {!isHumanTurn && (
              <div className="game-board__wait-message">
                Waiting for {currentPlayer.name}...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game over screen - Requirements: 7.3 */}
      {gameState.phase === 'gameOver' && (
        <GameOver 
          players={gameState.players}
          onNewGame={handleNewGame}
        />
      )}

      {/* Hand complete screen - Requirements: 7.3 */}
      {gameState.phase === 'handComplete' && (
        <HandComplete 
          players={gameState.players}
          onNewHand={handleNewHand}
        />
      )}

      {/* Rules modal */}
      {showRules && <Rules onClose={() => setShowRules(false)} />}
    </div>
  );
}
