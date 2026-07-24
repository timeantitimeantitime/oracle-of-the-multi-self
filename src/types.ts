export interface Card {
  name: string;
  keywords: string;
  meaning: string;
  message: string;
  filename: string;
  imageSrc: string;
}

export type ReadingLayout = 'single' | 'three-card' | 'celtic-cross';

export interface Reading {
  id: string;
  layout: ReadingLayout;
  cards: Card[];
  timestamp: number;
  positions?: string[];
}

export interface PaymentState {
  status: 'idle' | 'loading' | 'pending' | 'success' | 'error';
  method: 'crypto' | 'fiat' | null;
  error?: string;
}

export type ViewMode = 'home' | 'reading' | 'browser' | 'detail' | 'payment';
