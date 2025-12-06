# Models Directory

This directory contains TypeScript type definitions, interfaces, and data structures that define the core data model for the Hearts game.

## Files

**Card.ts** - Card representation and utilities
- `Card` interface - Individual card (suit, rank, value)
- `Suit` type - 'hearts' | 'diamonds' | 'clubs' | 'spades'
- `Rank` type - '2' through 'A'
- `createCard()` - Factory function for creating cards
- `cardsEqual()` - Compares two cards for equality
- `cardToString()` - Converts card to readable string
- **Edit this for**: Card structure, suit/rank definitions, card utilities

**Deck.ts** - Deck management and dealing
- `createDeck()` - Creates a standard 52-card deck
- `shuffle()` - Randomizes deck order using Fisher-Yates algorithm
- `deal()` - Deals cards to 4 players in clockwise order
- **Edit this for**: Deck operations, shuffling algorithm, dealing logic

**GameState.ts** - Central game state definition
- `GameState` interface - Complete game state structure
- `Player` interface - Player data (name, hand, tricks, scores)
- `PlayedCard` interface - Card with player ID for tricks
- `GamePhase` type - 'passing' | 'playing' | 'handComplete' | 'gameOver'
- `PassingDirection` type - 'left' | 'right' | 'across' | 'none'
- Helper functions:
  - `createPlayer()` - Creates new player with default values
  - `getCurrentPlayer()` - Gets current player from game state
  - `getCurrentPhase()` - Gets current game phase
  - `isPlayerTurn()` - Checks if it's a specific player's turn
  - `getTricksPlayed()` - Counts completed tricks
  - `isFirstTrick()` - Checks if current trick is the first
  - `getLedSuit()` - Gets the suit that was led in current trick
  - `getPassingDirection()` - Gets passing direction for hand number
  - `findPlayerWith2OfClubs()` - Finds who has 2 of Clubs
- **Edit this for**: Game state structure, player properties, phase definitions

**index.ts** - Barrel export file
- Re-exports all types and functions from other model files
- Allows importing from `'../models'` instead of individual files
- **Edit this for**: Adding new model exports

## Key Interfaces

### GameState
The central data structure containing all game information:
```typescript
interface GameState {
  players: Player[];              // 4 players (1 human, 3 AI)
  currentPlayerIndex: number;     // Whose turn it is
  dealerIndex: number;           // Who dealt this hand
  phase: GamePhase;              // Current game phase
  passingDirection: PassingDirection; // How cards are passed
  handNumber: number;            // Current hand (1-based)
  currentTrick: PlayedCard[];    // Cards played in current trick
  heartsBroken: boolean;         // Whether Hearts can be led
  selectedCardsForPassing: Map<string, Card[]>; // Cards selected for passing
}
```

### Player
Represents each player (human or AI):
```typescript
interface Player {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  isHuman: boolean;              // Human vs AI player
  hand: Card[];                  // Cards in hand
  tricksTaken: Card[][];         // Tricks won this hand
  score: number;                 // Points this hand
  totalScore: number;            // Cumulative score
}
```

### Card
Represents a single playing card:
```typescript
interface Card {
  suit: Suit;                    // hearts, diamonds, clubs, spades
  rank: Rank;                    // 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
  value: number;                 // Numeric value for comparison (2-14)
}
```

## Design Principles

### Immutability
All types are designed for immutable updates:
- Use spread operator: `{...gameState, phase: 'playing'}`
- Arrays are replaced, not mutated: `[...hand, newCard]`
- Objects are shallow-copied with changes

### Type Safety
Strict TypeScript types prevent common errors:
- Union types for phases and directions prevent typos
- Required properties ensure complete data
- Interfaces provide clear contracts

### Pure Functions
Helper functions are pure (no side effects):
- Same inputs always produce same outputs
- No mutations of input parameters
- Easy to test and reason about

## Common Tasks

**Adding new game state property:**
1. Add property to `GameState` interface in `GameState.ts`
2. Update initialization in `src/logic/gameInitialization.ts`
3. Update any helper functions that use the state
4. Update components that display or modify the state

**Modifying player data:**
1. Update `Player` interface in `GameState.ts`
2. Update `createPlayer()` function
3. Check all logic functions that use player data
4. Update UI components that display player info

**Adding new card properties:**
1. Update `Card` interface in `Card.ts`
2. Update `createCard()` function
3. Update `createDeck()` in `Deck.ts` if needed
4. Update card comparison and display functions

## Dependencies

```
Card.ts → (no dependencies)
Deck.ts → Card.ts
GameState.ts → Card.ts
index.ts → All model files
```

All other directories depend on models:
- `logic/` uses all model types for game rules
- `components/` imports types for props and rendering
- `hooks/` uses GameState and related types for state management

## Testing

Model files have comprehensive test coverage:
- **Card.test.ts** - Tests card creation and utilities
- **Deck.test.ts** - Tests deck creation, shuffling, and dealing
- **GameState.test.ts** - Tests state helpers and validation

Run tests with: `npm test`
