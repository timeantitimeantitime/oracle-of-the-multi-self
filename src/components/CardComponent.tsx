import { useState } from 'react';
import { Card } from '../types';

interface CardComponentProps {
  card: Card;
  isFlipped?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardComponent({ card, isFlipped = false, onClick, size = 'md' }: CardComponentProps) {
  const [flipped, setFlipped] = useState(isFlipped);

  const handleClick = () => {
    setFlipped(!flipped);
    onClick?.();
  };

  const sizeClasses = {
    sm: 'w-[180px] h-[320px]',
    md: 'w-[225px] h-[400px]',
    lg: 'w-[270px] h-[480px]',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`card-container ${sizeClasses[size]} cursor-pointer flex-shrink-0`}
        onClick={handleClick}
      >
        <div className={`card-inner w-full h-full relative ${flipped ? 'flipped' : ''}`}>
        {/* Front - Card back design */}
        <div className="card-front absolute inset-0 overflow-hidden bg-black">
          <img
            src={`${import.meta.env.BASE_URL}cards/cardback.png`}
            alt="Oracle of the Multi-Self"
            className="w-full h-full object-contain"
          />
        </div>

          {/* Back - Card image */}
          <div className="card-back absolute inset-0 overflow-hidden bg-black">
            <img
              src={card.imageSrc}
              alt={card.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Card info when flipped */}
      {flipped && (
        <div className="text-center max-w-[225px] px-2">
          <h3 className="text-sm font-medium text-slate-700 mb-1">{card.name}</h3>
          {card.keywords && (
            <p className="text-xs text-slate-400">{card.keywords}</p>
          )}
          {card.meaning && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
              {card.meaning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
