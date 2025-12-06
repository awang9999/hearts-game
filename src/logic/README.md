# Logic Directory

This directory contains pure functions that implement the Hearts game rules and logic. All functions are stateless and thoroughly tested.

## Logic Modules

### Game Lifecycle

**gameInitialization.ts** - Game and hand setup
- `initializeGame()` - Creates new game with 4 players, deals cards
- `initializeNewHand()` - Starts a new hand, rotates dealer, deals new cards
- **Edit this for**: Initial game setup, player creation, hand initialization

**gameEnding.ts** - Game completion logic
- `shouldGameEnd()` - Checks if any player reached 100 points
- `determineWinner()` - Finds player with lowest score
- `transitionToGameOver()` - Transitions to game over phase
- **Edit this for**: Win conditions, game ending rules

### Card Passing

**cardPassing.ts** - Card passing mechanics
- `validatePassingSelection()` - Ensures exactly 3 cards selected
- `validateCardsInHand()` - Verifies cards are in player's hand
- `getPassingTargetIndex()` - Calculates who receives cards (left/right/across)
- `selectCardsForPassing()` - Records player's card selection
- `executeCardPassing()` - Exchanges cards between all players
- `allPlayersHaveSelected()` - Checks if passing phase is complete
- **Edit this for**: Passing rules, card exchange logic

**aiPassing.ts** - AI card passing strategy
- `evaluateCardDanger()` - Rates how dangerous a card is to keep
- `selectAICardsToPass()` - AI selects 3 cards to pass
- **Edit this for**: AI passing strategy, card evaluation

### Playing Cards

**moveValidation.ts** - Card play validation
- `isValidPlay()` - Validates if a card can be played
- `getValidPlays()` - Returns all valid cards for current situation
- `followsSuit()` - Checks if card matches led suit
- `hasSuit()` - Checks if player has cards of a suit
- `canLeadHearts()` - Validates leading Hearts
- `isValidFirstTrickPlay()` - First trick restrictions (no penalty cards)
- `wouldBreakHearts()` - Checks if play breaks Hearts
- **Edit this for**: Play validation rules, suit following, Hearts breaking

**aiPlaying.ts** - AI card playing strategy
- `evaluateCardSafety()` - Rates how safe a card is to play
- `selectAICardToPlay()` - AI selects which card to play
- **Edit this for**: AI playing strategy, card selection logic

**trickResolution.ts** - Trick completion
- `determineTrickWinner()` - Finds who won the trick (highest card of led suit)
- `isHandComplete()` - Checks if all 13 tricks played
- `resolveTrick()` - Awards trick to winner, updates state, checks hand completion
- `addCardToTrick()` - Adds a played card to current trick
- **Edit this for**: Trick winner logic, trick resolution, hand completion

### Scoring

**scoring.ts** - Score calculation
- `countHearts()` - Counts Hearts in tricks
- `hasQueenOfSpades()` - Checks for Queen of Spades
- `calculateHandScore()` - Calculates penalty points for a hand
- `hasShotTheMoon()` - Checks if player took all 26 points
- `applyShootingTheMoon()` - Applies -26 score for shooting the moon
- `updateCumulativeScores()` - Adds hand scores to total scores
- `scoreHand()` - Main scoring function (orchestrates all scoring)
- **Edit this for**: Scoring rules, penalty points, shooting the moon

### Persistence

**persistence.ts** - Game state persistence
- `saveGameState()` - Saves game to localStorage
- `loadGameState()` - Loads game from localStorage
- `clearSavedGameState()` - Removes saved game
- **Edit this for**: Save/load functionality, localStorage handling

## Design Principles

### Pure Functions
All logic functions are pure (no side effects):
- Same inputs always produce same outputs
- No external state modification
- Easy to test and reason about
- Can be used in any context

### Separation of Concerns
- **Logic**: Game rules and calculations (this directory)
- **State**: React state management (hooks directory)
- **UI**: Presentation and user interaction (components directory)
- **Models**: Type definitions and data structures (models directory)

### Testing
Every logic module has comprehensive tests:
- Unit tests for each function
- Edge case coverage
- Property-based tests with fast-check
- 100% coverage of game rules

## Common Tasks

**Adding a new game rule:**
1. Identify which module it belongs to (validation, scoring, etc.)
2. Add the function with clear JSDoc comments
3. Write comprehensive tests
4. Export from module and `index.ts`
5. Use in appropriate hook or component

**Modifying existing rules:**
1. Find the relevant function in the appropriate module
2. Update the implementation
3. Update or add tests
4. Verify all tests pass
5. Check if any dependent code needs updates

**Debugging game logic:**
1. Check the relevant module's tests
2. Add console.logs or debugger statements
3. Run specific test file: `npm test -- filename.test.ts`
4. Verify logic with property-based tests

## Module Dependencies

```
gameInitialization → models (Card, Deck, GameState)
cardPassing → models (Card, GameState)
moveValidation → models (Card, GameState)
trickResolution → models (Card, GameState), moveValidation
scoring → models (Card, Player)
gameEnding → models (GameState, Player)
aiPassing → models (Card), cardPassing
aiPlaying → models (Card, GameState), moveValidation
persistence → models (GameState)
```

## Key Algorithms

**Trick Winner Determination**: Highest card of led suit wins
**Hearts Breaking**: Hearts played off-suit breaks Hearts
**Shooting the Moon**: All 26 points = -26 score
**Passing Direction**: Cycles through left, right, across, none
**First Trick**: 2 of Clubs must lead, no penalty cards allowed
