# Hearts Card Game - Project Structure

## Overview
This is a React + TypeScript implementation of the Hearts card game, built with Vite.

## Technology Stack
- **React 19** - UI framework
- **TypeScript** - Type safety (strict mode enabled)
- **Vite** - Build tool and dev server
- **Vitest** - Unit test runner
- **fast-check** - Property-based testing library

## Project Structure

```
hearts-game/
├── src/
│   ├── components/     # React UI components
│   ├── models/         # TypeScript interfaces and types
│   ├── logic/          # Game logic (rules, scoring, AI)
│   ├── hooks/          # Custom React hooks (useGame, etc.)
│   ├── tests/          # Test files and utilities
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── .kiro/specs/        # Feature specifications
└── dist/               # Build output (generated)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Development Guidelines

### TypeScript Configuration
- Strict mode is enabled
- All code must be properly typed
- No implicit any types allowed

### Testing Strategy
- **Unit Tests**: Verify specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across many inputs
- All tests use Vitest and fast-check
- Property tests run minimum 100 iterations

### Folder Organization
- **components/**: Presentational React components
- **models/**: Type definitions for Card, Player, GameState, etc.
- **logic/**: Pure functions for game rules, scoring, AI
- **hooks/**: React hooks for state management
- **tests/**: Test files (co-located with source when appropriate)

## Next Steps
Follow the implementation plan in `.kiro/specs/hearts-card-game/tasks.md`
