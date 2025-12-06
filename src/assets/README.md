# Assets Directory

This directory contains static assets like images, icons, and SVG files used throughout the Hearts game application.

## Files

**react.svg** - React logo icon
- Default React/Vite template logo
- Currently not actively used in the game UI
- Can be replaced or removed if not needed

## Purpose

The assets directory is for:
- **Images**: Game graphics, card images, backgrounds
- **Icons**: UI icons, favicons, app icons
- **SVG files**: Scalable vector graphics for logos and icons
- **Fonts**: Custom font files (if needed)
- **Other static files**: Any non-code resources

## Adding New Assets

When adding new assets:
1. Place files in this directory or create subdirectories for organization
2. Import assets in components using relative paths:
   ```typescript
   import cardBack from '../assets/card-back.png';
   ```
3. For SVG files, you can import as React components:
   ```typescript
   import { ReactComponent as Logo } from '../assets/logo.svg';
   ```
4. Optimize images before adding (compress, resize appropriately)
5. Use descriptive filenames (e.g., `heart-icon.svg` not `icon1.svg`)

## Organization Suggestions

For larger projects, consider organizing by type:
```
assets/
  images/
    cards/
    backgrounds/
  icons/
  fonts/
```

## Current Usage

Currently, the game uses CSS-based card rendering rather than image assets. If you want to add card images or other visual assets, this is the place to put them.

## File Formats

Recommended formats:
- **PNG**: For images with transparency
- **JPG**: For photos or complex images without transparency
- **SVG**: For icons, logos, and scalable graphics
- **WEBP**: For modern browsers, better compression
