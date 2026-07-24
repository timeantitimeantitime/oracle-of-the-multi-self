import { useState } from 'react';
import { PaymentState } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle', method: null });
  const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH' | 'SOL'>('ETH');

  if (!isOpen) return null;

  const handleCryptoPayment = async () => {
    setPayment({ status: 'loading', method: 'crypto' });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/crypto/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 9.99,
          coin: selectedCoin,
          chain: selectedCoin === 'BTC' ? 'bitcoin' : selectedCoin === 'ETH' ? 'ethereum' : 'solana',
          description: 'Oracle of the Multi-Self - Full Deck Access',
          redirect_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.payment_url) {
        setPayment({ status: 'pending', method: 'crypto' });
        window.open(data.payment_url, '_blank');
        // Poll for payment status
        pollPaymentStatus(data.id);
      } else {
        setPayment({ status: 'error', method: 'crypto', error: 'Failed to create payment' });
      }
    } catch {
      setPayment({ status: 'error', method: 'crypto', error: 'Network error. Please try again.' });
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      try {
        const res = await fetch(`${apiUrl}/api/crypto/status/${paymentId}`);
        const data = await res.json();
        if (data.status === 'confirmed' || data.status === 'forwarded') {
          setPayment({ status: 'success', method: 'crypto' });
          onSuccess();
          return;
        }
        if (data.status === 'expired') {
          setPayment({ status: 'error', method: 'crypto', error: 'Payment expired' });
          return;
        }
      } catch {
        // continue polling
      }
    }
    setPayment({ status: 'error', method: 'crypto', error: 'Payment status unknown' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-indigo-200 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-light gradient-text text-center mb-2">
          Unlock Full Deck
        </h2>
        <p className="text-center text-sm text-slate-400 mb-6">
          $9.99 — Lifetime access to all 82 oracle cards
        </p>

        {payment.status === 'idle' && (
          <>
            {/* Crypto option */}
            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
                Pay with Crypto
              </div>
              <div className="flex gap-2 mb-3">
                {(['BTC', 'ETH', 'SOL'] as const).map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`flex-1 py-2 text-sm font-medium transition-all ${
                      selectedCoin === coin
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCryptoPayment}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 rounded-lg transition-all hover:scale-[1.02] glow-indigo text-sm"
              >
                Pay with {selectedCoin}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Fiat placeholder */}
            <button
              disabled
              className="w-full bg-slate-100 border border-slate-200 text-slate-400 py-3 text-sm cursor-not-allowed"
            >
              Card payment coming soon
            </button>
          </>
        )}

        {payment.status === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-slate-500">Creating payment...</p>
          </div>
        )}

        {payment.status === 'pending' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-sm text-slate-700 mb-2">Payment initiated</p>
            <p className="text-xs text-slate-500">
              Complete your payment in the opened window.
              <br />
              This page will update automatically.
            </p>
          </div>
        )}

        {payment.status === 'success' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✦</div>
            <p className="text-sm text-gold mb-4">Payment confirmed!</p>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Start Reading
            </button>
          </div>
        )}

        {payment.status === 'error' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚠</div>
            <p className="text-sm text-rose-400 mb-4">{payment.error}</p>
            <button
              onClick={() => setPayment({ status: 'idle', method: null })}
              className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
