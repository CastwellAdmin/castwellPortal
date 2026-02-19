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
          volume: 0,
        };
      });

      set({ tickers, isLoading: false });
    } catch (error) {
      console.error('Error fetching market data:', error);
      set({ tickers: [], isLoading: false });
    }
  },

  fetchSectors: async () => {
    // Derive sector data from current tickers
    const tickers = get().tickers;
    const sectorMap = new Map<string, { total: number; count: number }>();

    for (const ticker of tickers) {
      const existing = sectorMap.get(ticker.sector) || { total: 0, count: 0 };
      existing.total += ticker.changePercent;
      existing.count += 1;
      sectorMap.set(ticker.sector, existing);
    }

    const sectors: MarketSector[] = Array.from(sectorMap.entries()).map(([name, data]) => ({
      name,
      performance: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
      volume: 0,
    }));

    set({ sectors });
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
        priceHistory = candleData.t.map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          open: Math.round(candleData.o[index] * 100) / 100,
          high: Math.round(candleData.h[index] * 100) / 100,
          low: Math.round(candleData.l[index] * 100) / 100,
          close: Math.round(candleData.c[index] * 100) / 100,
          volume: candleData.v[index],
        }));
      }

      set({
        selectedTicker: ticker,
        priceHistory,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
      const ticker = get().tickers.find((t) => t.symbol === symbol);
      set({
        selectedTicker: ticker || null,
        priceHistory: [],
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
