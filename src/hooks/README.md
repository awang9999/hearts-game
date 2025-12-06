# Hooks Directory

This directory contains custom React hooks for state management and side effects.

## Hooks Overview

### useGame.ts - Main Game State Hook

The central hook that manages all game state and actions for the Hearts game.

**Purpose**: Provides a clean interface between UI components and game logic, handling state updates, AI processing, and persistence.

**Key Responsibilities:**
- Game state management (useState)
- Game initialization and hand management
- Card passing coordination
- Card playing and validation
- AI turn processing with delays
- Trick resolution and scoring
- Game persistence (localStorage)
- Error handling

**Exported Functions:**

```typescript
{
  gameState,           // Current game state
  error,              // Error message (if any)
  isProcessingAI,     // Whether AI is thinking
  startNewGame,       // Initialize a new game
  startNewHand,       // Start next hand
  selectPassingCards, // Human player selects cards to pass
  executePassingPhase,// Execute card passing
  playCard,           // Play a card
  loadSavedGame,      // Load from localStorage
  clearSavedGame      // Clear saved state
}
```

**State Management:**
- `gameState` - Main game state (GameState type)
- `error` - Error messages for user feedback
- `isProcessingAI` - Blocks interactions during AI turns
- `isShowingTrick` - Prevents actions during trick display

**Key Effects:**

1. **Passing Phase Effect** - Executes card passing when all players have selected
2. **AI Processing Effect** - Automatically processes AI turns based on game phase
3. **Fast Mode Support** - Reads localStorage for speed settings

**Timing & Delays:**
- AI thinking delay: 800ms (normal) / 200ms (fast mode)
- Trick display: 2000ms (normal) / 800ms (fast mode)
- Passing execution: 500ms delay

**Edit this for:**
- Game state management logic
- AI processing timing
- State persistence
- Error handling
- Phase transitions

## Common Tasks

**Adding new game actions:**
1. Create a new callback function with `useCallback`
2. Update game state using logic functions from `../logic/`
3. Save state with `saveGameState()`
4. Handle errors appropriately
5. Export the function from the hook

**Modifying AI behavior:**
- Adjust delays in `processAITurn` callback
- Update AI processing conditions in effects
- Modify fast mode timing values

**Debugging state issues:**
- Check the effects and their dependencies
- Verify state updates create new objects (React immutability)
- Check localStorage persistence
- Review callback dependencies
