import { useState, useCallback, useEffect } from 'react';
import type { Card } from '../models/Card';
import { cardsEqual } from '../models/Card';
import type { GameState } from '../models/GameState';
import {
  initializeGame,
  initializeNewHand,
  selectCardsForPassing,
  allPlayersHaveSelected,
  executeCardPassing,
  isValidPlay,
  addCardToTrick,
  resolveTrick,
  scoreHand,
  checkAndTransitionToGameOver,
  selectAICardsToPass,
  selectAICardToPlay,
  saveGameState,
  loadGameState,
  clearSavedGameState
} from '../logic';

/**
 * Custom hook for managing Hearts game state and actions
 * Requirements: 11.2, 11.3
 */
export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isShowingTrick, setIsShowingTrick] = useState(false);

  /**
   * Starts a new game
   * Requirements: 11.2
   */
  const startNewGame = useCallback(() => {
    try {
      setError(null);
      const newGame = initializeGame();
      setGameState(newGame);
      saveGameState(newGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new game');
    }
  }, []);

  /**
   * Starts a new hand (after completing a hand)
   * Requirements: 11.2
   */
  const startNewHand = useCallback(() => {
    if (!gameState) {
      setError('No active game');
      return;
    }

    try {
      setError(null);
      const newHandState = initializeNewHand(gameState);
      setGameState(newHandState);
      saveGameState(newHandState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new hand');
    }
  }, [gameState]);

  /**
   * Selects cards for passing (human player)
   * Requirements: 11.2, 11.3
   */
  const selectPassingCards = useCallback((playerId: string, cards: Card[]) => {
    if (!gameState) {
      setError('No active game');
      return;
    }

    if (gameState.phase !== 'passing') {
      setError('Not in passing phase');
      return;
    }

    try {
      setError(null);
      const updatedState = selectCardsForPassing(gameState, playerId, cards);
      setGameState(updatedState);
      saveGameState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid card selection');
    }
  }, [gameState]);

  /**
   * Executes the card passing exchange
   * Requirements: 11.2
   */
  const executePassingPhase = useCallback(() => {
    if (!gameState) {
      setError('No active game');
      return;
    }

    if (gameState.phase !== 'passing') {
      setError('Not in passing phase');
      return;
    }

    try {
      setError(null);
      const updatedState = executeCardPassing(gameState);
      setGameState(updatedState);
      saveGameState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute passing');
    }
  }, [gameState]);

  /**
   * Plays a card (human player)
   * Requirements: 11.2, 11.3
   */
  const playCard = useCallback((playerId: string, card: Card) => {
    if (!gameState) {
      setError('No active game');
      return;
    }

    if (gameState.phase !== 'playing') {
      setError('Not in playing phase');
      return;
    }

    if (isShowingTrick) {
      // Prevent playing during trick display
      return;
    }

    // Check fast mode setting
    let fastMode = false;
    try {
      fastMode = localStorage.getItem('hearts-fast-mode') === 'true';
    } catch (e) {
      // localStorage not available
    }
    const trickDisplayDelay = fastMode ? 800 : 2000;

    // Find the player
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      setError('Player not found');
      return;
    }

    // Validate it's the player's turn
    if (gameState.players[gameState.currentPlayerIndex].id !== playerId) {
      setError('Not your turn');
      return;
    }

    // Validate the move
    if (!isValidPlay(card, player.hand, gameState)) {
      setError('Invalid card play');
      return;
    }

    try {
      setError(null);

      // Remove card from player's hand
      const updatedPlayers = gameState.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            hand: p.hand.filter(c => !cardsEqual(c, card))
          };
        }
        return p;
      });

      // Add card to trick
      let updatedState: GameState = {
        ...gameState,
        players: updatedPlayers
      };
      updatedState = addCardToTrick(updatedState, card, playerId);

      // Move to next player
      updatedState = {
        ...updatedState,
        currentPlayerIndex: (updatedState.currentPlayerIndex + 1) % 4
      };

      // Check if trick is complete
      if (updatedState.currentTrick.length === 4) {
        setIsShowingTrick(true);
        
        // Resolve the trick immediately to prevent inconsistent state
        let resolvedState = resolveTrick(updatedState);

        // Check if hand is complete
        if (resolvedState.phase === 'handComplete') {
          // Score the hand (mutates players array)
          scoreHand(resolvedState.players);

          // Create new state object to trigger React re-render
          resolvedState = {
            ...resolvedState,
            players: [...resolvedState.players]
          };

          // Check if game should end
          resolvedState = checkAndTransitionToGameOver(resolvedState);
        }

        // Show the complete trick for 2 seconds before clearing - Requirements: 10.5
        // We temporarily set the trick back to show the cards
        const displayState = {
          ...resolvedState,
          currentTrick: updatedState.currentTrick
        };
        
        setGameState(displayState);
        // Don't save the display state - save the resolved state
        saveGameState(resolvedState);

        // After delay, update to the resolved state (clears the trick)
        setTimeout(() => {
          setGameState(resolvedState);
          setIsShowingTrick(false);
        }, trickDisplayDelay);
      } else {
        // Save state immediately for incomplete tricks
        setGameState(updatedState);
        saveGameState(updatedState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play card');
    }
  }, [gameState, isShowingTrick]);

  /**
   * Processes AI turns
   * Requirements: 8.1, 8.3, 11.2
   */
  const processAITurn = useCallback(() => {
    if (!gameState || isProcessingAI || isShowingTrick) {
      return;
    }

    // Check fast mode setting
    let fastMode = false;
    try {
      fastMode = localStorage.getItem('hearts-fast-mode') === 'true';
    } catch (e) {
      // localStorage not available
    }
    const aiThinkDelay = fastMode ? 200 : 800;
    const trickDisplayDelay = fastMode ? 800 : 2000;

    // In passing phase, process all AI players at once
    if (gameState.phase === 'passing') {
      const aiPlayers = gameState.players.filter(p => !p.isHuman);
      const unselectedAI = aiPlayers.filter(
        p => !gameState.selectedCardsForPassing.has(p.id)
      );

      if (unselectedAI.length === 0) {
        return; // All AI players have already selected
      }

      setIsProcessingAI(true);

      // Add delay for realism - Requirements: 8.3
      setTimeout(() => {
        try {
          let updatedState = gameState;

          // Have all AI players select their cards
          for (const aiPlayer of unselectedAI) {
            const cardsToPass = selectAICardsToPass(
              aiPlayer.hand,
              gameState.passingDirection
            );

            updatedState = selectCardsForPassing(
              updatedState,
              aiPlayer.id,
              cardsToPass
            );
          }

          setGameState(updatedState);
          saveGameState(updatedState);
          setIsProcessingAI(false);
          
          // The passing execution will be handled by the dedicated effect
        } catch (err) {
          setError(err instanceof Error ? err.message : 'AI passing failed');
          setIsProcessingAI(false);
        }
      }, aiThinkDelay);
      return;
    }

    // In playing phase, process current player if AI
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Only process if it's an AI player's turn
    if (currentPlayer.isHuman) {
      return;
    }

    setIsProcessingAI(true);

    // Add delay for realism - Requirements: 8.3
    setTimeout(() => {
      try {
        // AI selects a card to play
        const cardToPlay = selectAICardToPlay(currentPlayer.hand, gameState);

        // Remove card from AI's hand
        const updatedPlayers = gameState.players.map(p => {
          if (p.id === currentPlayer.id) {
            return {
              ...p,
              hand: p.hand.filter(c => !cardsEqual(c, cardToPlay))
            };
          }
          return p;
        });

        // Add card to trick
        let updatedState: GameState = {
          ...gameState,
          players: updatedPlayers
        };
        updatedState = addCardToTrick(updatedState, cardToPlay, currentPlayer.id);

        // Move to next player
        updatedState = {
          ...updatedState,
          currentPlayerIndex: (updatedState.currentPlayerIndex + 1) % 4
        };

        // Check if trick is complete
        if (updatedState.currentTrick.length === 4) {
          setIsShowingTrick(true);
          
          // Resolve the trick immediately to prevent inconsistent state
          let resolvedState = resolveTrick(updatedState);

          // Check if hand is complete
          if (resolvedState.phase === 'handComplete') {
            // Score the hand (mutates players array)
            scoreHand(resolvedState.players);

            // Create new state object to trigger React re-render
            resolvedState = {
              ...resolvedState,
              players: [...resolvedState.players]
            };

            // Check if game should end
            resolvedState = checkAndTransitionToGameOver(resolvedState);
          }

          // Show the complete trick for 2 seconds before clearing - Requirements: 10.5
          // We temporarily set the trick back to show the cards
          const displayState = {
            ...resolvedState,
            currentTrick: updatedState.currentTrick
          };
          
          setGameState(displayState);
          // Don't save the display state - save the resolved state
          saveGameState(resolvedState);

          // After delay, update to the resolved state (clears the trick)
          setTimeout(() => {
            setGameState(resolvedState);
            setIsProcessingAI(false);
            setIsShowingTrick(false);
          }, trickDisplayDelay);
        } else {
          // Save state immediately for incomplete tricks
          setGameState(updatedState);
          saveGameState(updatedState);
          setIsProcessingAI(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'AI turn failed');
        setIsProcessingAI(false);
      }
    }, aiThinkDelay);
  }, [gameState, isProcessingAI, isShowingTrick]);

  /**
   * Loads a saved game from localStorage
   * Requirements: 11.2
   */
  const loadSavedGame = useCallback(() => {
    try {
      setError(null);
      const savedState = loadGameState();
      if (savedState) {
        setGameState(savedState);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved game');
      return false;
    }
  }, []);

  /**
   * Clears the saved game
   */
  const clearSavedGame = useCallback(() => {
    clearSavedGameState();
  }, []);

  /**
   * Effect to execute passing when all players have selected
   * Requirements: 11.2
   */
  useEffect(() => {
    if (!gameState || isProcessingAI) {
      return;
    }

    // Check if we're in passing phase and all players have selected
    if (gameState.phase === 'passing' && allPlayersHaveSelected(gameState)) {
      setIsProcessingAI(true);
      
      // Execute passing after a brief delay
      setTimeout(() => {
        try {
          const passedState = executeCardPassing(gameState);
          setGameState(passedState);
          saveGameState(passedState);
          setIsProcessingAI(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to execute passing');
          setIsProcessingAI(false);
        }
      }, 500);
    }
  }, [gameState, isProcessingAI]);

  /**
   * Effect to process AI turns automatically
   * Requirements: 11.2
   */
  useEffect(() => {
    if (!gameState || isProcessingAI || isShowingTrick) {
      return;
    }

    // In passing phase, AI players select cards regardless of currentPlayerIndex
    if (gameState.phase === 'passing') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      processAITurn();
      return;
    }

    // In playing phase, only process if it's an AI player's turn
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (gameState.phase === 'playing' && !currentPlayer.isHuman) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      processAITurn();
    }
  }, [gameState, isProcessingAI, isShowingTrick, processAITurn]);

  return {
    gameState,
    error,
    isProcessingAI,
    startNewGame,
    startNewHand,
    selectPassingCards,
    executePassingPhase,
    playCard,
    loadSavedGame,
    clearSavedGame
  };
}
