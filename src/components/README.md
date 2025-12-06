# Components Directory

This directory contains all React UI components for the Hearts card game.

## Component Overview

### Core Game Components

**GameBoard.tsx** - Main game container and orchestrator
- Manages overall game layout and phase transitions
- Coordinates between all other components
- Handles trick winner animations and display
- Integrates the useGame hook for state management
- **Edit this for**: Overall layout changes, phase transitions, game flow

**PlayerHand.tsx** - Displays the human player's cards
- Renders cards in a horizontal layout
- Handles card selection and click events
- Shows disabled/selected states
- **Edit this for**: Player hand display, card interaction

**OpponentDisplay.tsx** - Shows AI opponent information
- Displays opponent name, stats (tricks, hand score, total score)
- Shows active player indicator and thinking animation
- Positioned for top, left, or right players
- **Edit this for**: AI player display, opponent stats

**PassingInterface.tsx** - Card passing selection UI
- Allows selecting 3 cards to pass
- Tracks selection state and validates
- Provides confirm button
- **Edit this for**: Card passing mechanics, selection UI

### Game Phase Components

**GameOver.tsx** - End game screen
- Shows final scores and winner
- Provides "New Game" button
- **Edit this for**: Game over screen, winner display

**HandComplete.tsx** - End of hand screen
- Shows hand scores before next hand
- Provides "New Hand" button
- **Edit this for**: Hand completion screen

**GameControls.tsx** - Game control buttons
- New Game and New Hand buttons
- Conditional rendering based on phase
- **Edit this for**: Game control buttons

### Utility Components

**CardComponent.tsx** - Individual card display
- Renders a single card with suit and rank
- Supports different sizes (small, medium, large)
- Handles selected/disabled states
- **Edit this for**: Card appearance, card styling

**TrickArea.tsx** - Central trick display (legacy)
- Originally displayed all cards in current trick
- Now replaced by cards on table surface
- **Note**: Currently unused but kept for reference

**ScoreBoard.tsx** - Scoreboard display (legacy)
- Originally displayed all player scores in a separate panel
- Now replaced by integrated player scoreboxes
- **Note**: Currently unused but kept for reference

**Rules.tsx** - Game rules modal
- Displays comprehensive game rules
- Modal overlay with close functionality
- **Edit this for**: Rules content, modal behavior

**ErrorBoundary.tsx** - Error handling wrapper
- Catches React errors and displays fallback UI
- Prevents entire app crashes
- **Edit this for**: Error handling, error display

## File Naming Convention

- `*.tsx` - React component implementation
- `*.css` - Component-specific styles
- `*.test.tsx` - Component unit tests
- `index.ts` - Barrel export file

## Key Patterns

### Component Structure
Most components follow this pattern:
1. TypeScript interface for props
2. Helper functions (if needed)
3. Main component function
4. Export statement

### Styling
- Each component has its own CSS file
- Uses BEM-like naming convention (e.g., `component__element--modifier`)
- Responsive breakpoints for mobile, tablet, and desktop
- Performance optimizations with `will-change` and `backface-visibility`

### Testing
- Each component has comprehensive tests
- Uses React Testing Library
- Tests user interactions and rendering
- Validates accessibility

## Common Tasks

**Adding a new component:**
1. Create `ComponentName.tsx` and `ComponentName.css`
2. Add tests in `ComponentName.test.tsx`
3. Export from `index.ts`
4. Import and use in parent component

**Modifying layout:**
- Edit `GameBoard.tsx` for overall structure
- Edit component-specific CSS for individual styling
- Check responsive breakpoints in CSS files

**Changing game flow:**
- Edit `GameBoard.tsx` for phase transitions
- Edit `useGame.ts` hook (in ../hooks/) for state logic
