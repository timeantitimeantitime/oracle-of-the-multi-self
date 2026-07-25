import { useState, useEffect, useCallback } from 'react';
import { ReadingLayout, ViewMode, Card } from './types';
import { WalletProvider, useWallet, EARN_PER_DRAW } from './lib/wallet';
import ReadingView from './components/ReadingView';
import CardBrowser from './components/CardBrowser';
import CardDetail from './components/CardDetail';
import WalletButton from './components/WalletButton';

function ParticleField() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      color:
        i % 3 === 0
          ? 'bg-indigo-400'
          : i % 3 === 1
          ? 'bg-violet-400'
          : 'bg-gold',
    }))
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle absolute rounded-full ${p.color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function EarnToast({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 text-sm font-medium shadow-lg animate-bounce">
      +{amount} ASCEND earned ✦
    </div>
  );
}

function AppInner() {
  const [view, setView] = useState<ViewMode>('home');
  const [layout, setLayout] = useState<ReadingLayout>('single');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [earnToast, setEarnToast] = useState<number | null>(null);

  const { connected, earnTokens } = useWallet();

  const handleCardDraw = useCallback(() => {
    if (connected) {
      const success = earnTokens(EARN_PER_DRAW);
      if (success) {
        setEarnToast(EARN_PER_DRAW);
      }
    }
  }, [connected, earnTokens]);

  const handleStartReading = (l: ReadingLayout) => {
    setLayout(l);
    setView('reading');
  };

  if (selectedCard) {
    return (
      <>
        <ParticleField />
        <CardDetail
          card={selectedCard}
          onBack={() => setSelectedCard(null)}
        />
      </>
    );
  }

  if (view === 'reading') {
    return (
      <>
        <ParticleField />
        <ReadingView
          layout={layout}
          onBack={() => setView('home')}
          onCardDraw={handleCardDraw}
        />
      </>
    );
  }

  if (view === 'browser') {
    return (
      <>
        <ParticleField />
        <CardBrowser
          onSelectCard={(card) => {
            setSelectedCard(card);
            setView('home');
          }}
          onBack={() => setView('home')}
        />
      </>
    );
  }

  return (
    <>
      <ParticleField />
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative z-10">
        {/* Wallet */}
        <div className="absolute top-4 right-4 z-20">
          <WalletButton />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">✦</div>
          <h1 className="text-3xl md:text-5xl font-light gradient-text mb-3">
            Oracle of the Multi-Dimensional Self
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            A quantum oracle card deck for ascension technologies,
            light quotients, and multidimensional self-realization
          </p>
          {connected && (
            <p className="text-xs text-indigo-500 mt-2">
              Earn {EARN_PER_DRAW} ASCEND per card draw
            </p>
          )}
        </div>

        {/* Reading Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
          <button
            onClick={() => handleStartReading('single')}
            className="group bg-white border border-indigo-200 p-6 text-center hover:border-indigo-400 transition-all hover:scale-105 glow-indigo"
          >
            <div className="text-2xl mb-2">🃏</div>
            <div className="text-sm font-medium text-indigo-600 mb-1">Single Card</div>
            <div className="text-xs text-slate-500">Quick guidance</div>
          </button>

          <button
            onClick={() => handleStartReading('three-card')}
            className="group bg-white border border-violet-200 p-6 text-center hover:border-violet-400 transition-all hover:scale-105 glow-violet"
          >
            <div className="text-2xl mb-2">◇</div>
            <div className="text-sm font-medium text-violet-600 mb-1">Three Cards</div>
            <div className="text-xs text-slate-500">Past · Present · Future</div>
          </button>

          <button
            onClick={() => handleStartReading('celtic-cross')}
            className="group bg-white border border-gold/30 p-6 text-center hover:border-gold transition-all hover:scale-105 glow-gold"
          >
            <div className="text-2xl mb-2">✧</div>
            <div className="text-sm font-medium text-gold mb-1">Celtic Cross</div>
            <div className="text-xs text-slate-500">Deep reading</div>
          </button>
        </div>

        {/* Browse */}
        <button
          onClick={() => setView('browser')}
          className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          Browse all cards →
        </button>
      </div>

      {earnToast && (
        <EarnToast amount={earnToast} onDone={() => setEarnToast(null)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppInner />
    </WalletProvider>
  );
}
