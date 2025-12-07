# Mobile Optimization Changes

## Summary
Optimized the Hearts card game for small mobile devices (iPhone and similar) with the following improvements:

## 1. Footer Component
- Created a minimalistic footer with your name (Alexander Wang) and link to https://alexander-wang.net
- Semi-transparent design with backdrop blur effect
- Smooth hover animations
- Fully responsive and accessible

## 2. Mobile Menu (Hamburger)
- Replaced the top bar controls with a hamburger menu on screens ≤768px
- Slide-in modal from the right side
- Contains all game controls:
  - Rules button
  - Fast Mode toggle
  - New Game button
  - New Hand button (when applicable)
- Smooth animations and touch-optimized

## 3. Card Size Optimization
- Significantly reduced card sizes on mobile:
  - Small cards: 32px × 45px (480px screens), 28px × 40px (375px screens)
  - Medium cards: 42px × 59px (480px screens), 38px × 53px (375px screens)
  - Large cards: 56px × 78px (480px screens), 50px × 70px (375px screens)
- Reduced card spacing in hand to 0.15rem (480px) and 0.1rem (375px)

## 4. Game Table Optimization
- Reduced table surface size on mobile:
  - 220px × 170px on 480px screens
  - Smaller padding and gaps throughout
- Optimized hearts badge size (1.5rem on mobile)

## 5. Component Optimizations
- **OpponentDisplay**: Smaller fonts, tighter spacing, reduced min-widths
- **PlayerHand**: Tighter card gaps, reduced padding
- **PassingInterface**: Smaller buttons and text
- **GameBoard**: Compact layout with reduced spacing

## Desktop Experience
- **No changes to wide-view experience** - all optimizations only apply to screens ≤768px
- Desktop users see the original layout with full controls in the header

## Breakpoints
- Desktop: >768px (unchanged)
- Mobile: ≤768px (hamburger menu)
- Small mobile: ≤480px (reduced card sizes)
- Very small: ≤375px (further reduced sizes)
