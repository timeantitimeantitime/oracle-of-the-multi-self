import { Card } from '../types';

interface CardDetailProps {
  card: Card;
  position?: string;
  onBack: () => void;
}

export default function CardDetail({ card, position, onBack }: CardDetailProps) {
  return (
    <div className="min-h-screen bg-void p-4 md:p-8">
      <button
        onClick={onBack}
        className="mb-6 text-indigo-600 hover:text-indigo-500 transition-colors text-sm flex items-center gap-2"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {position && (
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-violet-600 bg-violet-100 px-3 py-1">
            {position}
          </span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-[270px] aspect-[9/16] overflow-hidden mx-auto">
              <img
                src={card.imageSrc}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-light gradient-text mb-4">
              {card.name}
            </h1>

            {card.keywords && (
              <div className="mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-gold">Keywords</span>
                <p className="text-sm text-gold mt-1">{card.keywords}</p>
              </div>
            )}

            <div className="mb-6">
              <span className="text-xs uppercase tracking-[0.2em] text-indigo-500">Meaning</span>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto pr-2">
                {card.meaning}
              </p>
            </div>

            {card.message && (
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-violet-500">Message</span>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2">
                  {card.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
