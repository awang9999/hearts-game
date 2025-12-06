# Design Document

## Overview

The Hearts card game will be implemented as a single-page React application that runs entirely in the browser. The game supports one human player competing against three AI opponents in the classic card game Hearts. The application will feature a mobile-friendly interface optimized for iPad use, with all game logic, state management, and AI decision-making handled client-side.

The architecture follows a component-based design with clear separation between game logic, state management, UI components, and AI strategy. The game will use React hooks for state management and implement a turn-based game loop that coordinates between the human player and AI opponents.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI Layer   │  │  Game State  │  │  AI Engine   │ │
│  │              │  │  Management  │  │              │ │
│  │ - GameBoard  │  │              │  │ - Strategy   │ │
│  │ - PlayerHand │  │ - useGame    │  │ - Decision   │ │
│  │ - ScoreBoard │  │   Hook       │  │   Making     │ │
│  │ - TrickArea  │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                           │                             │
│  ┌────────────────────────┴──────────────────────────┐ │
│  │              Game Logic Layer                      │ │
│  │                                                     │ │
│  │  - Card & Deck Models                             │ │
│  │  - Game Rules Engine                              │ │
│  │  - Trick Resolution                               │ │
│  │  - Scoring Calculator                             │ │
│  │  - Move Validator                                 │ │
│  └────────────────────────────────────────────────────┘ │
│                           │                             │
│  ┌────────────────────────┴──────────────────────────┐ │
│  │           Browser Storage (localStorage)          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

The application is organized into three main layers:

1. **UI Layer**: React components responsible for rendering the game interface
2. **Game State Management**: Custom hooks and state logic for managing game flow
3. **Game Logic Layer**: Pure functions implementing Hearts rules and mechanics
4. **AI Engine**: Strategic decision-making for computer opponents

## Components and Interfaces

### Core Data Models

#### Card Model
```typescript
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number; // 2-14 for comparison
}
```

#### Player Model
```typescript
interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  tricksTaken: Card[][];
  score: number;
  totalScore: number;
}
```

#### Game State Model
```typescript
interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dealerIndex: number;
  phase: 'passing' | 'playing' | 'handComplete' | 'gameOver';
  passingDirection: 'left' | 'right' | 'across' | 'none';
  handNumber: number;
  currentTrick: PlayedCard[];
  heartsbroken: boolean;
  selectedCardsForPassing: Map<string, Card[]>;
}

interface PlayedCard {
  card: Card;
  playerId: string;
}
```

### Game Logic Interfaces

#### Deck Manager
```typescript
interface DeckManager {
  createDeck(): Card[];
  shuffle(deck: Card[]): Card[];
  deal(deck: Card[], numPlayers: number): Card[][];
}
```

#### Rules Engine
```typescript
interface RulesEngine {
  isValidPlay(card: Card, hand: Card[], trick: PlayedCard[], 
               heartsbroken: boolean, isFirstTrick: boolean): boolean;
  canLeadHearts(hand: Card[], heartsbroken: boolean): boolean;
  mustFollowSuit(hand: Card[], ledSuit: string): boolean;
  determineWinner(trick: PlayedCard[]): string;
  isFirstTrick(handNumber: number, trickNumber: number): boolean;
}
```

#### Scoring Calculator
```typescript
interface ScoringCalculator {
  calculateHandScore(tricksTaken: Card[][]): number;
  checkShootingMoon(scores: Map<string, number>): boolean;
  applyShootingMoon(scores: Map<string, number>, shooterId: string): Map<string, number>;
}
```

### AI Engine Interface

```typescript
interface AIEngine {
  selectCardsToPass(hand: Card[], direction: string): Card[];
  selectCardToPlay(hand: Card[], trick: PlayedCard[], 
                   gameState: GameState): Card;
  evaluateCardSafety(card: Card, gameState: GameState): number;
}
```

### UI Components

#### Main Components
- **App**: Root component managing routing and global state
- **GameBoard**: Main game container orchestrating all game elements
- **PlayerHand**: Displays and manages the human player's cards
- **OpponentDisplay**: Shows opponent positions and basic info
- **TrickArea**: Displays the current trick being played
- **ScoreBoard**: Shows current and cumulative scores
- **PassingInterface**: UI for selecting cards to pass
- **GameControls**: Start game, new hand, and other controls

## Data Models

### Card Representation

Cards are represented with suit and rank properties. The value property provides numeric comparison (2-14) for determining trick winners. Special cards are identified by their suit and rank combination:
- Queen of Spades: `{ suit: 'spades', rank: 'Q' }`
- Hearts: `{ suit: 'hearts', rank: any }`

### Game Flow State Machine

```
[Game Start] → [Passing Phase] → [Playing Phase] → [Hand Complete]
                      ↑                                    ↓
                      └────────────────────────────────────┘
                                (if game not over)
                                       ↓
                                [Game Over]
```

### Passing Direction Cycle

The passing direction follows a 4-hand cycle:
1. Hand 1: Pass left
2. Hand 2: Pass right
3. Hand 3: Pass across
4. Hand 4: No passing
5. Repeat cycle

## Data Flow

### Turn Execution Flow

1. **Determine Current Player**: Check whose turn it is
2. **Get Valid Moves**: Calculate legal plays based on hand and game state
3. **Player Action**:
   - Human: Wait for card selection
   - AI: Execute AI decision algorithm
4. **Validate Move**: Ensure play follows Hearts rules
5. **Update Trick**: Add card to current trick
6. **Check Trick Complete**: If all 4 players have played
7. **Resolve Trick**: Determine winner, update tricks taken
8. **Check Hand Complete**: If all 13 tricks played
9. **Calculate Scores**: Award penalty points
10. **Check Game Over**: If any player ≥ 100 points
11. **Next Turn/Hand/Game**: Advance to next state

### State Updates

All state updates flow through the central game state managed by React hooks. The state is immutable, with updates creating new state objects. This ensures predictable rendering and makes it easier to implement features like undo or game replay.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Deck completeness
*For any* game initialization, the deck should contain exactly 52 unique cards with all combinations of 4 suits and 13 ranks.
**Validates: Requirements 1.2**

### Property 2: Fair dealing
*For any* valid deal, each of the 4 players should receive exactly 13 cards, and no card should appear in multiple hands.
**Validates: Requirements 1.4**

### Property 3: Passing preserves hand size
*For any* passing phase, after cards are exchanged, each player should still have exactly 13 cards.
**Validates: Requirements 2.3**

### Property 4: Passing direction cycle
*For any* sequence of hands, the passing direction should follow the pattern: left, right, across, none, and repeat.
**Validates: Requirements 2.4**

### Property 5: First trick leader has 2♣
*For any* game, the player who leads the first trick should be the player holding the 2♣.
**Validates: Requirements 3.1**

### Property 6: Valid plays follow suit rules
*For any* card play, it should be valid if and only if: (a) it follows the led suit when the player has cards of that suit, or (b) it can be any card when the player has no cards of the led suit.
**Validates: Requirements 3.2, 3.3**

### Property 7: Trick winner determination
*For any* completed trick, the winner should be the player who played the highest-ranked card of the suit that was led.
**Validates: Requirements 3.4**

### Property 8: Trick winner leads next
*For any* trick that is not the last trick of a hand, the player who won the trick should be the player whose turn it is to lead the next trick.
**Validates: Requirements 3.5**

### Property 9: Hearts leading restriction
*For any* attempt to lead a Heart card, it should be invalid if Hearts have not been broken, unless the player has only Hearts in their hand.
**Validates: Requirements 4.1, 4.3**

### Property 10: Hearts breaking trigger
*For any* play where a Heart is played on a trick where the led suit is not Hearts, the heartsbroken flag should be set to true for the remainder of the hand.
**Validates: Requirements 4.2**

### Property 11: First trick penalty restriction
*For any* card played on the first trick, if it is a Heart or the Queen of Spades, it should be invalid unless the player has only penalty cards.
**Validates: Requirements 5.1**

### Property 12: Hand scoring accuracy
*For any* completed hand, each player's score should equal the number of Hearts they captured plus 13 if they captured the Queen of Spades.
**Validates: Requirements 6.1, 6.2**

### Property 13: Shooting the moon adjustment
*For any* completed hand where one player captured all 26 penalty points, either that player's score should decrease by 26 or all other players' scores should increase by 26.
**Validates: Requirements 6.3**

### Property 14: Score accumulation
*For any* sequence of hands, each player's total score should equal the sum of their scores from all completed hands.
**Validates: Requirements 6.4**

### Property 15: Game ending condition
*For any* game state, if any player's total score is greater than or equal to 100, the game should be in the "gameOver" phase.
**Validates: Requirements 7.1**

### Property 16: Winner determination
*For any* completed game, the winner should be the player with the lowest total score.
**Validates: Requirements 7.2**

### Property 17: AI plays valid moves
*For any* game state where an AI must play, the card selected by the AI should be a valid play according to all game rules.
**Validates: Requirements 8.2**

### Property 18: AI passes exactly three cards
*For any* passing phase, each AI player should select exactly 3 cards from their hand to pass.
**Validates: Requirements 8.4**

### Property 19: Game state persistence round trip
*For any* game state, serializing it to browser storage and then deserializing should produce an equivalent game state.
**Validates: Requirements 11.4**

## Error Handling

### Invalid Move Handling

When a player attempts an invalid move, the system should:
1. Prevent the move from being executed
2. Provide clear feedback about why the move is invalid
3. Maintain the current game state unchanged
4. Allow the player to select a different card

### AI Error Recovery

If the AI encounters an error in decision-making:
1. Log the error for debugging
2. Fall back to selecting the first valid card from the hand
3. Continue game execution without crashing

### State Corruption Detection

The game should validate state integrity at key points:
- After dealing cards
- After passing cards
- After each trick completion
- After score calculation

If state corruption is detected:
1. Log the corrupted state
2. Attempt to recover to the last valid state from localStorage
3. If recovery fails, offer to restart the game

### Browser Storage Errors

If localStorage is unavailable or full:
1. Continue game execution in memory only
2. Display a warning that progress cannot be saved
3. Disable the resume game feature

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific examples and edge cases:

**Card and Deck Operations:**
- Creating a standard 52-card deck
- Shuffling maintains deck size
- Dealing distributes cards correctly

**Game Rules:**
- First trick must be led with 2♣
- Penalty cards cannot be played on first trick (except when player has only penalty cards)
- Hearts cannot be led until broken (except when player has only Hearts)

**Scoring:**
- Shooting the moon with all 26 points
- Correct point calculation for various trick combinations
- Game ending at 100 points

**AI Behavior:**
- AI selects valid cards in various game states
- AI passes exactly 3 cards
- AI handles edge cases (only Hearts in hand, only penalty cards, etc.)

### Property-Based Testing Approach

Property-based tests will verify universal properties across many randomly generated inputs using **fast-check** (a property-based testing library for JavaScript/TypeScript).

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for Cards, Hands, GameStates, and Tricks
- Each property test will be tagged with a comment referencing the design document property

**Test Tagging Format:**
```typescript
// Feature: hearts-card-game, Property 2: Fair dealing
```

**Property Test Coverage:**

Each correctness property listed above will be implemented as a single property-based test. The tests will:

1. Generate random valid game states
2. Execute the operation being tested
3. Verify the property holds for the resulting state

**Key Properties to Test:**
- Deck completeness and dealing fairness (Properties 1-2)
- Passing mechanics (Properties 3-4)
- Trick-taking rules (Properties 5-8)
- Hearts breaking rules (Properties 9-10)
- First trick restrictions (Property 11)
- Scoring accuracy (Properties 12-14)
- Game ending and winner determination (Properties 15-16)
- AI validity (Properties 17-18)
- State persistence (Property 19)

**Generator Strategy:**

Custom generators will be created for:
- **Cards**: Generate valid suit/rank combinations
- **Hands**: Generate sets of 13 unique cards
- **Game States**: Generate valid game states at various phases
- **Tricks**: Generate partial and complete tricks with valid plays
- **Edge Cases**: Generators will include edge cases like:
  - Hands with only Hearts
  - Hands with only penalty cards
  - First trick scenarios
  - Shooting the moon scenarios

The property-based tests will complement unit tests by exploring a much wider input space and catching edge cases that might not be considered in example-based testing.

## AI Strategy

### Card Passing Strategy

The AI will evaluate cards to pass based on:
1. **High-value penalty avoidance**: Prefer passing high Hearts (A, K, Q) and Queen of Spades
2. **Suit length balancing**: Avoid creating void suits that force taking penalties
3. **High card exposure**: Pass high cards in suits where we have few cards

### Card Playing Strategy

The AI will use a rule-based strategy with the following priorities:

**When Leading:**
1. If safe, lead low cards from long suits
2. Avoid leading suits where we hold high cards
3. Lead spades if we don't have the Queen
4. If forced to lead Hearts, lead high Hearts to avoid taking them later

**When Following Suit:**
1. If we cannot win the trick, play the highest card that won't win
2. If we must win, play the lowest card that wins
3. On the first trick, play the highest card possible (since no points)
4. Avoid taking the Queen of Spades unless shooting the moon

**When Unable to Follow Suit (Sloughing):**
1. If someone else will take the trick, dump high penalty cards
2. Prioritize dumping Queen of Spades if safe
3. Dump high Hearts
4. Keep low cards for future control

**Shooting the Moon Detection:**
1. Track if any player has taken multiple penalty cards
2. If an opponent is shooting, try to take a penalty card to block them
3. Only attempt shooting if we have strong high cards in multiple suits

### AI Difficulty Levels (Future Enhancement)

The current design implements a single AI difficulty. Future versions could implement:
- **Easy**: Random valid moves
- **Medium**: Basic rule-based strategy (current implementation)
- **Hard**: Advanced strategy with card counting and opponent modeling

## Mobile-Friendly Design Considerations

### Touch Interaction
- Card selection uses tap events with visual feedback
- Minimum touch target size of 44x44 pixels
- Swipe gestures for viewing opponent hands (if implemented)

### Responsive Layout
- Flexbox/Grid layout adapts to portrait and landscape orientations
- Card sizes scale based on viewport dimensions
- Font sizes use relative units (rem/em) for accessibility

### Performance
- Minimize re-renders using React.memo and useMemo
- Lazy load components not immediately needed
- Optimize card images (SVG or optimized PNG)

### Visual Design
- High contrast for card visibility
- Clear indication of playable vs. unplayable cards
- Smooth animations for card movement (CSS transitions)
- Loading states for AI "thinking" time

## Technology Stack

### Core Technologies
- **React 18+**: UI framework with hooks
- **TypeScript**: Type safety for game logic
- **Vite**: Build tool and dev server
- **CSS Modules** or **Styled Components**: Component styling

### Testing
- **Vitest**: Unit test runner
- **fast-check**: Property-based testing library
- **React Testing Library**: Component testing

### State Management
- **React Hooks** (useState, useReducer, useContext): Built-in state management
- **localStorage API**: Game state persistence

### Deployment
- Static hosting (Netlify, Vercel, or traditional web server)
- No backend required

## Future Enhancements

Potential features for future iterations:
1. **Multiplayer**: Add WebSocket support for real multiplayer
2. **Difficulty Levels**: Multiple AI difficulty settings
3. **Statistics**: Track wins, average scores, shooting the moon frequency
4. **Themes**: Different card designs and table backgrounds
5. **Animations**: Enhanced card movement and trick-taking animations
6. **Sound Effects**: Audio feedback for card plays and trick wins
7. **Undo Move**: Allow taking back the last play (in single-player)
8. **Game Variants**: Support for different Hearts rule variants
9. **Tutorial Mode**: Interactive tutorial for new players
10. **Accessibility**: Screen reader support, keyboard navigation
