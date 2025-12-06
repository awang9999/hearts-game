import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardComponent } from './CardComponent';
import { createCard } from '../models';

describe('CardComponent', () => {
  it('should render a card with correct suit and rank', () => {
    const card = createCard('hearts', 'A');
    render(<CardComponent card={card} />);
    
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('♥')).toBeDefined();
  });

  it('should render different card sizes', () => {
    const card = createCard('spades', 'K');
    const { container } = render(<CardComponent card={card} size="large" />);
    
    expect(container.querySelector('.card--large')).toBeDefined();
  });

  it('should apply selected state', () => {
    const card = createCard('diamonds', 'Q');
    const { container } = render(<CardComponent card={card} selected={true} />);
    
    expect(container.querySelector('.card--selected')).toBeDefined();
  });

  it('should apply disabled state', () => {
    const card = createCard('clubs', 'J');
    const { container } = render(<CardComponent card={card} disabled={true} />);
    
    expect(container.querySelector('.card--disabled')).toBeDefined();
  });

  it('should render red suits in red color', () => {
    const heartCard = createCard('hearts', '10');
    const { container } = render(<CardComponent card={heartCard} />);
    
    expect(container.querySelector('.card--red')).toBeDefined();
  });

  it('should render black suits in black color', () => {
    const clubCard = createCard('clubs', '9');
    const { container } = render(<CardComponent card={clubCard} />);
    
    expect(container.querySelector('.card--black')).toBeDefined();
  });
});
