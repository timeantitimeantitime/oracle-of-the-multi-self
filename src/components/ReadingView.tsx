import { useState } from 'react';
import { Card, ReadingLayout } from '../types';
import { drawCards } from '../lib/cards';
import CardComponent from './CardComponent';
import CardDetail from './CardDetail';

interface ReadingViewProps {
  layout: ReadingLayout;
  onBack: () => void;
  onCardDraw: () => void;
}

const LAYOUT_CONFIG: Record<ReadingLayout, { count: number; positions: string[]; title: string }> = {
  single: { count: 1, positions: ['Current Energy'], title: 'Single Card Pull' },
  'three-card': {
    count: 3,
    positions: ['Past', 'Present', 'Future'],
    title: 'Three-Card Reading',
  },
  'celtic-cross': {
    count: 10,
    positions: [
      'Present',
      'Challenge',
      'Past',
      'Future',
      'Above',
      'Below',
      'Advice',
      'External',
      'Hopes',
      'Outcome',
    ],
    title: 'Celtic Cross',
  },
};

export default function ReadingView({ layout, onBack, onCardDraw }: ReadingViewProps) {
  const config = LAYOUT_CONFIG[layout];
  const [drawnCards] = useState<Card[]>(() => drawCards(config.count));
  const [revealed, setRevealed] = useState<boolean[]>(new Array(config.count).fill(false));
  const [selectedCard, setSelectedCard] = useState<{ card: Card; position: string } | null>(null);

  const allRevealed = revealed.every(Boolean);

  const handleReveal = (index: number) => {
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    onCardDraw();
  };

  const handleRevealAll = () => {
    setRevealed(new Array(config.count).fill(true));
    for (let i = 0; i < config.count; i++) {
      onCardDraw();
    }
  };

  if (selectedCard) {
    return (
      <CardDetail
        card={selectedCard.card}
        position={selectedCard.position}
        onBack={() => setSelectedCard(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-void p-4 md:p-8">
      <button
        onClick={onBack}
        className="mb-6 text-indigo-600 hover:text-indigo-500 transition-colors text-sm flex items-center gap-2"
      >
        <span>←</span>
        <span>New Reading</span>
      </button>

      <h2 className="text-xl md:text-2xl font-light gradient-text text-center mb-8">
        {config.title}
      </h2>

      {!allRevealed && (
        <div className="text-center mb-8">
          <button
            onClick={handleRevealAll}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 transition-all hover:scale-105 glow-indigo text-sm"
          >
            Reveal All Cards
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div
        className={`flex flex-wrap justify-center gap-6 md:gap-8 ${
          layout === 'celtic-cross' ? 'max-w-5xl mx-auto' : ''
        }`}
      >
        {drawnCards.map((card, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="text-xs text-violet-500 uppercase tracking-widest">
              {config.positions[index]}
            </div>
            {revealed[index] ? (
              <div
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedCard({ card, position: config.positions[index] })}
              >
                <CardComponent card={card} isFlipped={true} size="md" />
              </div>
            ) : (
              <div
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleReveal(index)}
              >
                <CardComponent card={card} isFlipped={false} size="md" />
              </div>
            )}
          </div>
        ))}
      </div>

      {allRevealed && (
        <div className="text-center mt-16">
          <p className="text-sm text-slate-500 mb-4">
            Click any card to read its full meaning
          </p>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-500 transition-colors text-sm"
          >
            ← Start a new reading
          </button>
        </div>
      )}
    </div>
  );
}
