import { useWallet, EARN_PER_DRAW, DAILY_LIMIT } from '../lib/wallet';

export default function WalletButton() {
  const { connected, publicKey, ascendBalance, tier, todayEarnings, connect, disconnect } = useWallet();

  if (connected && publicKey) {
    const remaining = DAILY_LIMIT - todayEarnings;
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-slate-600 font-medium">
            {ascendBalance.toFixed(1)} ASCEND
          </div>
          {tier && (
            <div className="text-xs text-indigo-600">{tier}</div>
          )}
          <div className="text-xs text-slate-400">
            +{EARN_PER_DRAW} per draw · {remaining.toFixed(1)} left today
          </div>
        </div>
        <button
          onClick={disconnect}
          className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 text-xs hover:bg-slate-200 transition-colors"
        >
          {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm transition-colors"
    >
      Connect Phantom Wallet
    </button>
  );
}
