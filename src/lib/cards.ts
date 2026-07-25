import { Card } from '../types';
import cardsData from '../data/cards.json';

export const cards: Card[] = cardsData.map((card) => ({
  ...card,
  imageSrc: `${import.meta.env.BASE_URL}cards/${card.filename}`,
}));

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(count: number): Card[] {
  const shuffled = shuffleDeck(cards);
  return shuffled.slice(0, count);
}

export function searchCards(query: string): Card[] {
  const lower = query.toLowerCase();
  return cards.filter(
    (card) =>
      card.name.toLowerCase().includes(lower) ||
      card.keywords.toLowerCase().includes(lower) ||
      card.meaning.toLowerCase().includes(lower)
  );
}
