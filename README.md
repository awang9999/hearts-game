# Hearts Card Game

A modern, fully-featured implementation of the classic Hearts card game built with React, TypeScript, and Vite. Play against three AI opponents with a clean, responsive interface optimized for desktop, tablet, and mobile devices.

![Hearts Game](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tests](https://img.shields.io/badge/tests-240%20passing-brightgreen)

## About Hearts

Hearts is a classic trick-taking card game where the objective is to avoid taking penalty cards. The player with the lowest score when someone reaches 100 points wins the game.

[Learn more about Hearts on Wikipedia](https://en.wikipedia.org/wiki/Hearts_(card_game))

## Features

### Core Gameplay
- **Full Hearts Rules Implementation**
  - 4-player game (1 human, 3 AI opponents)
  - Card passing phase (left, right, across, none - rotating each hand)
  - 2 of Clubs leads the first trick
  - Must follow suit when able
  - Hearts breaking rules
  - Shooting the moon (all 26 penalty points = -26 score)
  - Game ends when a player reaches 100 points

### User Interface
- **Responsive Design**: Optimized for desktop, iPad, and mobile devices
- **Real-time Score Tracking**: View current hand scores and total scores for all players
- **Visual Feedback**: 
  - Leading card indicator (golden glow)
  - Active player highlighting
  - Trick winner announcements
  - AI "thinking" indicators
- **Game Controls**:
  - New Game / New Hand buttons
  - Fast Mode toggle for quicker gameplay
  - Rules modal with complete game instructions

### Technical Features
- **AI Opponents**: Three AI players with strategic card selection
- **State Persistence**: Game state saved to localStorage
- **Comprehensive Testing**: 240+ unit tests with Vitest
- **Type Safety**: Full TypeScript implementation
- **Performance Optimized**: Smooth animations and transitions

## Live Demo

🎮 **Play now**: https://hearts.alexander-wang.net

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hearts-game.git
cd hearts-game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Project Structure

```
hearts-game/
├── src/
│   ├── components/          # React components
│   │   ├── GameBoard.tsx    # Main game container
│   │   ├── PlayerHand.tsx   # Player's card hand
│   │   ├── OpponentDisplay.tsx  # AI player display
│   │   ├── PassingInterface.tsx # Card passing UI
│   │   ├── Rules.tsx        # Rules modal
│   │   └── ...
│   ├── hooks/
│   │   └── useGame.ts       # Main game state hook
│   ├── logic/               # Game logic (pure functions)
│   │   ├── gameInitialization.ts
│   │   ├── cardPassing.ts
│   │   ├── moveValidation.ts
│   │   ├── trickResolution.ts
│   │   ├── scoring.ts
│   │   ├── aiPlaying.ts
│   │   └── ...
│   ├── models/              # TypeScript types and models
│   │   ├── Card.ts
│   │   ├── GameState.ts
│   │   ├── Deck.ts
│   │   └── ...
│   └── tests/               # Test utilities
├── dist/                    # Production build output
└── public/                  # Static assets
```

## Game Rules

### Objective
Avoid taking penalty cards. The player with the lowest score wins.

### Card Values
- **Hearts**: 1 point each (13 total)
- **Queen of Spades**: 13 points
- **All other cards**: 0 points

### Passing Phase
Before each hand, players pass 3 cards:
1. **Hand 1**: Pass left
2. **Hand 2**: Pass right
3. **Hand 3**: Pass across
4. **Hand 4**: No passing
5. Cycle repeats

### Playing
- Player with 2 of Clubs leads the first trick
- Must follow suit if able
- Highest card of led suit wins the trick
- No penalty cards on first trick (unless only option)
- Hearts cannot be led until "broken" (played off-suit)

### Shooting the Moon
Taking all 26 penalty points scores -26 instead of +26

### Winning
Game ends when any player reaches 100 points. Lowest score wins!

## Technology Stack

- **Frontend Framework**: React 19.2
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Testing**: Vitest + React Testing Library
- **Property Testing**: fast-check
- **Styling**: CSS3 with responsive design
- **State Management**: React Hooks (useState, useEffect, useCallback)

## Development

### Code Organization
The project follows a clean architecture pattern:
- **Components**: Pure presentational components
- **Hooks**: State management and side effects
- **Logic**: Pure functions for game rules (easily testable)
- **Models**: Type definitions and data structures

### Testing Strategy
- **Unit Tests**: All game logic functions
- **Component Tests**: UI components with React Testing Library
- **Property-Based Tests**: Using fast-check for edge cases
- **Coverage**: 240+ tests covering core functionality

### Performance Optimizations
- Memoized callbacks with `useCallback`
- Efficient state updates
- CSS animations with hardware acceleration
- Responsive images and assets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

This project is deployed on AWS with S3, CloudFront, and Route 53.

**Live URL**: https://hearts.alexander-wang.net

### Quick Deployment

```bash
# First time deployment
./deploy.sh

# Update content
./update.sh

# Remove deployment
./teardown.sh
```

### Documentation

See **[documentation/DEPLOYMENT_GUIDE.md](documentation/DEPLOYMENT_GUIDE.md)** for complete deployment documentation including:
- Deployment scripts and workflows
- AWS resource configuration
- IAM permissions
- Troubleshooting
- Cost information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Hearts game rules based on the traditional card game
- Built with modern web technologies
- Inspired by classic card game implementations

## Contact

Project Link: [https://github.com/yourusername/hearts-game](https://github.com/yourusername/hearts-game)

---

Enjoy playing Hearts! 🃏♥️
