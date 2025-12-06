# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize React project with Vite and TypeScript
  - Install dependencies: fast-check for property testing, vitest for testing
  - Configure TypeScript with strict mode
  - Set up basic project folder structure (components, models, logic, hooks, tests)
  - _Requirements: 11.1_

- [x] 2. Implement core card and deck models
  - Create Card interface and type definitions
  - Implement deck creation function that generates all 52 cards
  - Implement shuffle function using Fisher-Yates algorithm
  - Implement deal function that distributes cards to 4 players
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for deck completeness
  - **Property 1: Deck completeness**
  - **Validates: Requirements 1.2**

- [ ]* 2.2 Write property test for fair dealing
  - **Property 2: Fair dealing**
  - **Validates: Requirements 1.4**

- [x] 3. Implement game state models and initialization
  - Create Player, GameState, and PlayedCard interfaces
  - Implement game initialization function that creates 4 players (1 human, 3 AI)
  - Implement function to determine which player has 2♣
  - Create helper functions for game state queries (current player, current phase, etc.)
  - _Requirements: 1.1, 3.1_

- [ ]* 3.1 Write property test for first trick leader
  - **Property 5: First trick leader has 2♣**
  - **Validates: Requirements 3.1**

- [x] 4. Implement card passing logic
  - Create function to determine passing direction based on hand number
  - Implement card passing exchange logic
  - Create validation for passing (exactly 3 cards selected)
  - Implement state transitions for passing phase
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 4.1 Write property test for passing preserves hand size
  - **Property 3: Passing preserves hand size**
  - **Validates: Requirements 2.3**

- [ ]* 4.2 Write property test for passing direction cycle
  - **Property 4: Passing direction cycle**
  - **Validates: Requirements 2.4**

- [x] 5. Implement move validation rules
  - Create function to check if a card follows suit
  - Implement function to get valid plays for a given hand and trick
  - Implement Hearts breaking detection and validation
  - Implement first trick penalty card restriction
  - Create comprehensive isValidPlay function
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2_

- [ ]* 5.1 Write property test for valid plays follow suit rules
  - **Property 6: Valid plays follow suit rules**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 5.2 Write property test for Hearts leading restriction
  - **Property 9: Hearts leading restriction**
  - **Validates: Requirements 4.1, 4.3**

- [ ]* 5.3 Write property test for Hearts breaking trigger
  - **Property 10: Hearts breaking trigger**
  - **Validates: Requirements 4.2**

- [ ]* 5.4 Write property test for first trick penalty restriction
  - **Property 11: First trick penalty restriction**
  - **Validates: Requirements 5.1**

- [x] 6. Implement trick resolution logic
  - Create function to determine trick winner based on led suit and card values
  - Implement function to update game state after trick completion
  - Create function to check if hand is complete (all 13 tricks played)
  - Implement turn order management (winner leads next trick)
  - _Requirements: 3.4, 3.5_

- [ ]* 6.1 Write property test for trick winner determination
  - **Property 7: Trick winner determination**
  - **Validates: Requirements 3.4**

- [ ]* 6.2 Write property test for trick winner leads next
  - **Property 8: Trick winner leads next**
  - **Validates: Requirements 3.5**

- [x] 7. Implement scoring system
  - Create function to count Hearts in a set of tricks
  - Create function to check if Queen of Spades is in tricks
  - Implement hand score calculation (Hearts + Q♠)
  - Implement shooting the moon detection
  - Implement shooting the moon score adjustment
  - Create function to update cumulative scores
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 7.1 Write property test for hand scoring accuracy
  - **Property 12: Hand scoring accuracy**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 7.2 Write property test for shooting the moon adjustment
  - **Property 13: Shooting the moon adjustment**
  - **Validates: Requirements 6.3**

- [ ]* 7.3 Write property test for score accumulation
  - **Property 14: Score accumulation**
  - **Validates: Requirements 6.4**

- [x] 8. Implement game ending logic
  - Create function to check if game should end (any player >= 100 points)
  - Implement winner determination (lowest score)
  - Create function to transition game to "gameOver" phase
  - _Requirements: 7.1, 7.2_

- [ ]* 8.1 Write property test for game ending condition
  - **Property 15: Game ending condition**
  - **Validates: Requirements 7.1**

- [ ]* 8.2 Write property test for winner determination
  - **Property 16: Winner determination**
  - **Validates: Requirements 7.2**

- [x] 9. Implement AI card passing strategy
  - Create function to evaluate card danger (high Hearts, Q♠)
  - Implement AI logic to select 3 cards to pass
  - Ensure AI passes exactly 3 valid cards from hand
  - _Requirements: 8.4_

- [ ]* 9.1 Write property test for AI passes exactly three cards
  - **Property 18: AI passes exactly three cards**
  - **Validates: Requirements 8.4**

- [x] 10. Implement AI card playing strategy
  - Create function to evaluate card safety for playing
  - Implement AI logic for leading a trick
  - Implement AI logic for following suit
  - Implement AI logic for sloughing (playing off-suit)
  - Ensure AI always selects valid moves
  - _Requirements: 8.1, 8.2_

- [ ]* 10.1 Write property test for AI plays valid moves
  - **Property 17: AI plays valid moves**
  - **Validates: Requirements 8.2**

- [x] 11. Implement game state persistence
  - Create functions to serialize game state to JSON
  - Create functions to deserialize game state from JSON
  - Implement localStorage save and load functions
  - Add auto-save after each significant state change
  - _Requirements: 11.4_

- [ ]* 11.1 Write property test for game state persistence round trip
  - **Property 19: Game state persistence round trip**
  - **Validates: Requirements 11.4**

- [x] 12. Create main game hook (useGame)
  - Implement useGame hook to manage all game state
  - Create action handlers for: start game, pass cards, play card, new hand
  - Integrate all game logic functions into the hook
  - Implement game loop that coordinates human and AI turns
  - Add error handling for invalid moves
  - _Requirements: 11.2, 11.3_

- [x] 13. Build core UI components
  - Create Card component with suit/rank display
  - Create PlayerHand component showing cards with selection
  - Create TrickArea component displaying current trick
  - Create ScoreBoard component showing all player scores
  - Create OpponentDisplay components for 3 AI players
  - Style components for mobile/iPad viewing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4_

- [x] 14. Build passing phase UI
  - Create PassingInterface component for card selection
  - Implement card selection toggle (select/deselect)
  - Add visual indication of selected cards
  - Create confirm button to submit passing selection
  - Display passing direction to user
  - _Requirements: 2.1, 9.2_

- [x] 15. Build playing phase UI
  - Integrate PlayerHand with click handlers for playing cards
  - Implement visual feedback for valid/invalid card plays
  - Add turn indicator showing whose turn it is
  - Display Hearts broken status
  - Implement trick completion animation/delay
  - Show trick winner before clearing trick
  - _Requirements: 3.2, 9.2, 10.3, 10.4, 10.5_

- [x] 16. Build game control UI
  - Create GameControls component with New Game button
  - Add New Hand button (for testing/debugging)
  - Implement game over screen with final scores and winner
  - Add restart game functionality
  - _Requirements: 7.3_

- [x] 17. Integrate AI turn execution
  - Implement AI turn timer (delay for realism)
  - Add visual indication when AI is "thinking"
  - Trigger AI card passing during passing phase
  - Trigger AI card playing during playing phase
  - Ensure smooth turn transitions between human and AI
  - _Requirements: 8.1, 8.3_

- [x] 18. Build main App component
  - Create App component that renders GameBoard
  - Integrate useGame hook
  - Add game initialization on mount
  - Implement resume game from localStorage on load
  - Add error boundaries for error handling
  - _Requirements: 11.1, 11.4_

- [x] 19. Add responsive styling and mobile optimization
  - Implement responsive layout using CSS Flexbox/Grid
  - Ensure touch targets are minimum 44x44 pixels
  - Test and adjust for iPad portrait and landscape
  - Add CSS transitions for card animations
  - Optimize card rendering performance
  - Ensure text is readable on mobile screens
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
