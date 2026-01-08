import { create } from 'zustand';
import type { StockTicker, MarketSector, PriceHistory } from '../types';

interface MarketState {
  tickers: StockTicker[];
  sectors: MarketSector[];
  selectedTicker: StockTicker | null;
  priceHistory: PriceHistory[];
  isLoading: boolean;
  fetchTickers: () => Promise<void>;
  fetchSectors: () => Promise<void>;
  fetchPriceHistory: (symbol: string) => Promise<void>;
  addTicker: (ticker: Omit<StockTicker, 'id'>) => void;
  removeTicker: (id: string) => void;
}

const MOCK_TICKERS: StockTicker[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.5,
    change: 2.3,
    changePercent: 1.31,
    sector: 'Technology',
    market: 'NASDAQ',
    volume: 52340000,
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.9,
    change: -1.2,
    changePercent: -0.32,
    sector: 'Technology',
    market: 'NASDAQ',
    volume: 23450000,
  },
  {
    id: '3',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.8,
    change: 0.8,
    changePercent: 0.56,
    sector: 'Technology',
    market: 'NASDAQ',
    volume: 18920000,
  },
  {
    id: '4',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.1,
    change: 5.4,
    changePercent: 2.28,
    sector: 'Automotive',
    market: 'NASDAQ',
    volume: 98760000,
  },
];

const MOCK_SECTORS: MarketSector[] = [
  { name: 'Technology', performance: 1.2, volume: 245000000 },
  { name: 'Healthcare', performance: -0.3, volume: 87000000 },
  { name: 'Financial Services', performance: 0.8, volume: 156000000 },
  { name: 'Consumer Goods', performance: 0.5, volume: 98000000 },
  { name: 'Energy', performance: -1.1, volume: 67000000 },
];

const generatePriceHistory = (currentPrice: number): PriceHistory[] => {
  const data: PriceHistory[] = [];
  let price = currentPrice * 0.95;

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const open = price;
    const change = price * (Math.random() - 0.5) * 0.03;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(20000000 + Math.random() * 30000000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });

    price = close;
  }

  return data;
};

export const useMarketStore = create<MarketState>((set, get) => ({
  tickers: [],
  sectors: [],
  selectedTicker: null,
  priceHistory: [],
  isLoading: false,

  fetchTickers: async () => {
    set({ isLoading: true });
    // TODO: Replace with real market data API (Alpha Vantage, IEX Cloud, etc.)
    // For now, using mock data until API is integrated
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ tickers: MOCK_TICKERS, isLoading: false });
  },

  fetchSectors: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ sectors: MOCK_SECTORS });
  },

  fetchPriceHistory: async (symbol: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const ticker = get().tickers.find((t) => t.symbol === symbol);
    if (ticker) {
      set({
        selectedTicker: ticker,
        priceHistory: generatePriceHistory(ticker.price),
        isLoading: false,
      });
    }
  },

  addTicker: (ticker: Omit<StockTicker, 'id'>) => {
    const newTicker = { ...ticker, id: Date.now().toString() };
    set((state) => ({ tickers: [...state.tickers, newTicker] }));
  },

  removeTicker: (id: string) => {
    set((state) => ({
      tickers: state.tickers.filter((t) => t.id !== id),
    }));
  },
}));
