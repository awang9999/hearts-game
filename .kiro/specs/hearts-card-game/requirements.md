# Requirements Document

## Introduction

This document specifies the requirements for a web-based implementation of the card game Hearts. The game will support exactly 4 players (1 human player and 3 AI opponents), following the modern 2011 rules variant. The application will be built as a frontend-only React application, designed to be mobile-friendly for iPad users and hosted on a web server.

## Glossary

- **Game System**: The Hearts card game web application
- **Player**: A human user participating in the game
- **AI Opponent**: A computer-controlled player
- **Hand**: The set of cards held by a player
- **Trick**: A round of play where each player plays one card
- **Penalty Card**: A Heart card (1 point each) or the Queen of Spades (13 points)
- **Shooting the Moon**: Capturing all penalty cards in a single hand
- **Breaking Hearts**: Playing the first Heart card in a game
- **Eldest Hand**: The player to the left of the dealer
- **Youngest Hand**: The player to the right of the dealer

## Requirements

### Requirement 1

**User Story:** As a player, I want to start a new game with 4 players, so that I can play Hearts against AI opponents.

#### Acceptance Criteria

1. WHEN a player accesses the game THEN the Game System SHALL initialize a game with exactly 4 players (1 human and 3 AI opponents)
2. WHEN the game starts THEN the Game System SHALL use a standard 52-card deck without removing any cards
3. WHEN the game starts THEN the Game System SHALL deal all cards individually and face down in clockwise order starting with the eldest hand
4. WHEN cards are dealt THEN the Game System SHALL ensure each player receives exactly 13 cards

### Requirement 2

**User Story:** As a player, I want to pass three cards to another player before each hand, so that I can improve my hand strategically.

#### Acceptance Criteria

1. WHEN a new hand begins THEN the Game System SHALL prompt each player to select exactly three cards from their hand
2. WHEN all players have selected three cards THEN the Game System SHALL exchange the cards according to a predetermined cycle (left, right, across, no pass)
3. WHEN the passing phase completes THEN the Game System SHALL update each player's hand with the received cards
4. WHEN four hands have been played THEN the Game System SHALL rotate the passing direction in the cycle

### Requirement 3

**User Story:** As a player, I want to play cards according to Hearts rules, so that the game follows standard gameplay.

#### Acceptance Criteria

1. WHEN a trick begins THEN the Game System SHALL allow the player holding 2♣ to lead it to the first trick
2. WHEN a player must play a card THEN the Game System SHALL require the player to follow suit if able
3. WHEN a player cannot follow suit THEN the Game System SHALL allow the player to play any card from their hand
4. WHEN all players have played a card THEN the Game System SHALL award the trick to the player who played the highest card of the led suit
5. WHEN a trick is won THEN the Game System SHALL allow the winning player to lead the next trick

### Requirement 4

**User Story:** As a player, I want Hearts to be broken before they can be led, so that the game follows proper Hearts restrictions.

#### Acceptance Criteria

1. WHEN a player attempts to lead a Heart THEN the Game System SHALL prevent the play if Hearts have not been broken
2. WHEN a player plays a Heart off-suit THEN the Game System SHALL mark Hearts as broken for the remainder of the hand
3. WHEN a player has only Hearts in their hand THEN the Game System SHALL allow the player to lead a Heart regardless of whether Hearts are broken

### Requirement 5

**User Story:** As a player, I want penalty cards restricted on the first trick, so that the game starts fairly.

#### Acceptance Criteria

1. WHEN the first trick is being played THEN the Game System SHALL prevent players from playing any Heart or the Queen of Spades
2. WHEN a player has only penalty cards for the first trick THEN the Game System SHALL allow the player to play a penalty card without counting its points

### Requirement 6

**User Story:** As a player, I want my score calculated based on penalty cards captured, so that I can track my performance.

#### Acceptance Criteria

1. WHEN a hand ends THEN the Game System SHALL award one penalty point for each Heart captured by each player
2. WHEN a hand ends THEN the Game System SHALL award thirteen penalty points for the Queen of Spades to the player who captured it
3. WHEN a player captures all penalty cards in a hand THEN the Game System SHALL either subtract 26 points from that player's score or add 26 points to all other players' scores
4. WHEN score is updated THEN the Game System SHALL persist the cumulative score for each player across hands

### Requirement 7

**User Story:** As a player, I want the game to end when a winning condition is met, so that I know when the game is complete.

#### Acceptance Criteria

1. WHEN any player reaches 100 points THEN the Game System SHALL end the game
2. WHEN the game ends THEN the Game System SHALL declare the player with the lowest score as the winner
3. WHEN the game ends THEN the Game System SHALL display final scores for all players

### Requirement 8

**User Story:** As a player, I want to play against AI opponents, so that I can play the game without requiring other human players.

#### Acceptance Criteria

1. WHEN the game starts THEN the Game System SHALL control all non-human players with AI logic
2. WHEN an AI opponent must make a decision THEN the Game System SHALL select a valid move according to game rules
3. WHEN an AI opponent plays THEN the Game System SHALL display the played card with appropriate timing
4. WHEN an AI opponent passes cards THEN the Game System SHALL select three cards using strategic logic

### Requirement 9

**User Story:** As a player using an iPad, I want a mobile-friendly interface, so that I can play comfortably on my device.

#### Acceptance Criteria

1. WHEN the game loads on a mobile device THEN the Game System SHALL display a responsive layout optimized for touch interaction
2. WHEN a player taps a card THEN the Game System SHALL provide clear visual feedback for card selection
3. WHEN cards are displayed THEN the Game System SHALL render them at a size appropriate for mobile viewing
4. WHEN the interface updates THEN the Game System SHALL maintain readability and usability on iPad screen sizes

### Requirement 10

**User Story:** As a player, I want to see game state clearly, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN viewing the game THEN the Game System SHALL display the current trick with all played cards
2. WHEN viewing the game THEN the Game System SHALL display each player's current score
3. WHEN viewing the game THEN the Game System SHALL indicate whose turn it is to play
4. WHEN viewing the game THEN the Game System SHALL display whether Hearts have been broken
5. WHEN a trick completes THEN the Game System SHALL briefly show the trick winner before clearing the trick

### Requirement 11

**User Story:** As a player, I want the game to run entirely in my browser, so that I can play without requiring a backend server.

#### Acceptance Criteria

1. WHEN the application loads THEN the Game System SHALL initialize all game state in the browser
2. WHEN game state changes THEN the Game System SHALL manage all state updates within the React application
3. WHEN a player makes a move THEN the Game System SHALL validate the move using client-side logic
4. WHEN the game progresses THEN the Game System SHALL persist game state in browser storage to allow resuming
