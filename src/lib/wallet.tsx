import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  ascendBalance: number;
  tier: string | null;
  todayEarnings: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  earnTokens: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  balance: 0,
  ascendBalance: 0,
  tier: null,
  todayEarnings: 0,
  connect: async () => {},
  disconnect: () => {},
  earnTokens: () => false,
});

const ASCEND_MINT = import.meta.env.VITE_ASCEND_MINT || '';
const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || 'https://api.devnet.solana.com';
const DAILY_LIMIT = 10;
const EARN_PER_DRAW = 0.1;

const TIERS = [
  { name: 'Oracle', min: 100000 },
  { name: 'Master', min: 10000 },
  { name: 'Initiate', min: 1000 },
  { name: 'Seeker', min: 100 },
];

async function getTokenBalance(rpcUrl: string, mint: string, owner: string): Promise<number> {
  const resp = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [owner, { mint }, { encoding: 'jsonParsed' }],
    }),
  });
  const data = await resp.json();
  const accounts = data.result?.value || [];
  if (accounts.length === 0) return 0;
  return parseInt(accounts[0].account.data.parsed.info.tokenAmount.amount, 10) / 10 ** 9;
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [ascendBalance, setAscendBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(() => {
    const key = `oracle_earnings_${getTodayKey()}`;
    const saved = localStorage.getItem(key);
    return saved ? parseFloat(saved) : 0;
  });

  const tier = TIERS.find((t) => ascendBalance >= t.min)?.name || null;

  const fetchBalances = useCallback(async (pubkey: string) => {
    try {
      const solResp = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'getBalance', params: [pubkey],
        }),
      });
      const solData = await solResp.json();
      setBalance((solData.result?.value || 0) / 10 ** 9);
    } catch {
      setBalance(0);
    }
    if (ASCEND_MINT) {
      try {
        setAscendBalance(await getTokenBalance(SOLANA_RPC, ASCEND_MINT, pubkey));
      } catch {
        setAscendBalance(0);
      }
    }
  }, []);

  const earnTokens = useCallback((amount: number) => {
    const key = `oracle_earnings_${getTodayKey()}`;
    const newTotal = todayEarnings + amount;
    if (newTotal > DAILY_LIMIT) return false;
    setTodayEarnings(newTotal);
    localStorage.setItem(key, String(newTotal));
    setAscendBalance((prev) => prev + amount);
    return true;
  }, [todayEarnings]);

  const connect = useCallback(async () => {
    const phantom = (window as any).phantom?.solana;
    if (!phantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    try {
      const resp = await phantom.connect();
      const pk = resp.publicKey.toString();
      setPublicKey(pk);
      setConnected(true);
      await fetchBalances(pk);
    } catch (err) {
      console.error('Phantom connect failed:', err);
    }
  }, [fetchBalances]);

  const disconnect = useCallback(() => {
    const phantom = (window as any).phantom?.solana;
    phantom?.disconnect();
    setPublicKey(null);
    setConnected(false);
    setBalance(0);
    setAscendBalance(0);
  }, []);

  useEffect(() => {
    const phantom = (window as any).phantom?.solana;
    if (phantom?.isConnected) {
      phantom.connect().then((resp: any) => {
        setPublicKey(resp.publicKey.toString());
        setConnected(true);
        fetchBalances(resp.publicKey);
      }).catch(() => {});
    }
  }, [fetchBalances]);

  return (
    <WalletContext.Provider value={{
      connected, publicKey, balance, ascendBalance, tier,
      todayEarnings, connect, disconnect, earnTokens,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
export { EARN_PER_DRAW, DAILY_LIMIT };
