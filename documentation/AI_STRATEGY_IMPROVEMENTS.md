# AI Strategy Improvements

## Overview
Enhanced the AI with advanced Hearts strategies based on expert play patterns.

## Key Strategies Implemented

### 1. Losing Tricks (Evasion)
- **Deliberate Lead Loss**: AI now leads very low cards (2-4) to deliberately lose the lead
- **Undershooting**: When following suit, AI plays just below the current high card to avoid winning
- **Safe Early Tricks**: AI recognizes early game tricks are safer and plays accordingly

### 2. Protecting Low Cards
- **Value of 2-4**: AI now protects very low cards (2-4) as they guarantee not winning tricks
- **Late Game Safety**: Low cards are especially valuable in dangerous final tricks
- **Strategic Preservation**: AI avoids passing or playing low cards unless necessary

### 3. Leading Hearts Strategy
- **Timing Matters**: AI holds low hearts for dangerous final tricks
- **High Hearts First**: When forced to lead hearts, AI leads high ones to avoid taking them later
- **Late Game Tactics**: In late game, AI strategically uses low hearts to pass the lead

### 4. Being Void or Long
- **Void Advantage**: AI recognizes being void allows safe sloughing of dangerous cards
- **Long Suit Defense**: Being long in spades (especially J and lower) defends against Queen smoking
- **Strategic Voiding**: AI considers creating voids during passing phase

### 5. Ace of Hearts
- **Moon Shot Prevention**: AI prioritizes dumping Ace of Hearts to prevent opponents from shooting the moon
- **High Priority Slough**: Ace of Hearts is sloughed when safe (especially as last player)
- **Passing Priority**: Ace of Hearts gets high danger score in passing phase

### 6. Queen of Spades
- **Smoking Out**: AI leads low spades in early game to force out the Queen
- **Long Spade Defense**: AI keeps low spades when long in suit to outlast smoking attempts
- **Undershooting Protection**: AI uses J♠ and lower to undershoot and avoid taking Queen
- **Passing Strategy**: AI avoids creating spade voids if holding Queen

### 7. High Cards in Short Suits
- **Danger Recognition**: High cards in short suits (≤3 cards) are prioritized for passing
- **Increased Risk**: AI assigns higher danger scores to A/K in suits with few cards
- **Void Creation**: AI may strategically create voids by passing all cards in short suits

## Passing Phase Improvements

### Enhanced Danger Evaluation
- Queen of Spades: 100 points (highest priority)
- Ace/King of Spades: 40 points (can force taking Queen)
- Ace of Hearts: 50 points (prevents moon shots)
- High Hearts: 3x card value
- Very low cards (2-4): -20 points (keep them!)
- Low spades when long: -10 points (defense)

### Smart Void Creation
- Avoids creating spade void if holding Queen
- Avoids voiding only low card in suit
- Strategically creates voids for sloughing advantage

## Playing Phase Improvements

### Leading Strategy
- Leads very low cards (2-4) to lose lead deliberately
- Smokes out Queen with low spades in early game
- Avoids leading high cards that might win
- Holds low hearts for late game lead passing

### Following Suit Strategy
- Undershoots by playing just below high card
- Protects very low cards (2-4) until late game
- Plays highest losing card to safely dispose of face cards
- Minimizes damage when forced to win

### Sloughing Strategy
- Prioritizes Queen of Spades disposal
- Dumps Ace of Hearts (especially as last player)
- Dumps high hearts (10+)
- Dumps high face cards in other suits
- Protects very low cards for future control

## Game Stage Awareness
- **Early Game** (0-3 tricks): Aggressive smoking, safe play
- **Mid Game** (4-9 tricks): Balanced strategy, void exploitation
- **Late Game** (10+ tricks): Protect low cards, careful lead management

## Result
The AI now plays much more strategically, making it a challenging opponent that:
- Avoids taking tricks more effectively
- Protects valuable low cards
- Exploits voids for safe sloughing
- Defends against Queen of Spades
- Prevents moon shots
- Makes smarter passing decisions
