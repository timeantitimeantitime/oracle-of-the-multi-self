import { useState } from 'react';
import { Card } from '../types';
import { cards, searchCards } from '../lib/cards';
import CardComponent from './CardComponent';

interface CardBrowserProps {
  onSelectCard: (card: Card) => void;
  onBack: () => void;
}

export default function CardBrowser({ onSelectCard, onBack }: CardBrowserProps) {
  const [query, setQuery] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const allKeywords = Array.from(
    new Set(cards.flatMap((c) => c.keywords.split(',').map((k) => k.trim()).filter(Boolean))
  )).sort();

  const filteredCards = query
    ? searchCards(query)
    : selectedKeywords.length > 0
    ? cards.filter((c) =>
        selectedKeywords.some((kw) =>
          c.keywords.toLowerCase().includes(kw.toLowerCase())
        )
      )
    : cards;

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  return (
    <div className="min-h-screen bg-void p-4 md:p-8">
      <button
        onClick={onBack}
        className="mb-6 text-indigo-600 hover:text-indigo-500 transition-colors text-sm flex items-center gap-2"
      >
        <span>←</span>
        <span>Home</span>
      </button>

      <h2 className="text-xl md:text-2xl font-light gradient-text text-center mb-6">
        Card Archive — {cards.length} Cards
      </h2>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white border border-indigo-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
        />
      </div>

      {/* Keyword filters */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {allKeywords.slice(0, 20).map((kw) => (
            <button
              key={kw}
              onClick={() => toggleKeyword(kw)}
              className={`text-xs px-3 py-1 border transition-all ${
                selectedKeywords.includes(kw)
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white border-indigo-200 text-slate-500 hover:border-indigo-400'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
        {filteredCards.map((card, index) => (
          <div
            key={index}
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onSelectCard(card)}
          >
            <CardComponent card={card} isFlipped={true} size="sm" />
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center text-slate-500 mt-12">
          No cards match your search
        </div>
      )}
    </div>
  );
}
