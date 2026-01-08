import { create } from 'zustand';
import { finnhubService } from '../services/finnhub';
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

// Default tickers to track
const DEFAULT_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', market: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', market: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', market: 'NYSE' },
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

    try {
      // Fetch real-time quotes from Finnhub
      const quotes = await finnhubService.getBatchQuotes(
        DEFAULT_TICKERS.map((t) => t.symbol)
      );

      const tickers: StockTicker[] = DEFAULT_TICKERS.map((ticker, index) => {
        const quote = quotes[index];

        return {
          id: (index + 1).toString(),
          symbol: ticker.symbol,
          name: ticker.name,
          sector: ticker.sector,
          market: ticker.market,
          price: quote?.c || 0,
          change: quote?.d || 0,
          changePercent: quote?.dp || 0,
          volume: 0, // Finnhub basic API doesn't provide volume in quote endpoint
        };
      });

      set({ tickers, isLoading: false });
    } catch (error) {
      console.error('Error fetching market data:', error);
      set({ tickers: [], isLoading: false });
    }
  },

  fetchSectors: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ sectors: MOCK_SECTORS });
  },

  fetchPriceHistory: async (symbol: string) => {
    set({ isLoading: true });

    try {
      const ticker = get().tickers.find((t) => t.symbol === symbol);

      if (!ticker) {
        set({ isLoading: false });
        return;
      }

      // Get last 30 days of candle data
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

      const candleData = await finnhubService.getCandles(
        symbol,
        'D',
        thirtyDaysAgo,
        now
      );

      let priceHistory: PriceHistory[] = [];

      if (candleData && candleData.s === 'ok') {
        // Convert Finnhub candle data to our format
        priceHistory = candleData.t.map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          open: Math.round(candleData.o[index] * 100) / 100,
          high: Math.round(candleData.h[index] * 100) / 100,
          low: Math.round(candleData.l[index] * 100) / 100,
          close: Math.round(candleData.c[index] * 100) / 100,
          volume: candleData.v[index],
        }));
      } else {
        // Fallback to generated data if API fails
        priceHistory = generatePriceHistory(ticker.price);
      }

      set({
        selectedTicker: ticker,
        priceHistory,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
      const ticker = get().tickers.find((t) => t.symbol === symbol);
      if (ticker) {
        set({
          selectedTicker: ticker,
          priceHistory: generatePriceHistory(ticker.price),
          isLoading: false,
        });
      }
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
