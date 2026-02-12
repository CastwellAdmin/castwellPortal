import { create } from 'zustand';
import { supabase, isDemoMode } from '../lib/supabase';
import type { PortfolioAsset, PortfolioSummary, PerformanceData } from '../types';

interface PortfolioState {
  portfolio: PortfolioSummary | null;
  performanceHistory: PerformanceData[];
  isLoading: boolean;
  fetchPortfolio: () => Promise<void>;
  fetchPerformanceHistory: () => Promise<void>;
}

const generatePerformanceHistory = (): PerformanceData[] => {
  const data: PerformanceData[] = [];
  const startValue = 50000;
  let currentValue = startValue;

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    currentValue = currentValue * (1 + (Math.random() - 0.48) * 0.02);

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue),
    });
  }

  return data;
};

const DEMO_ASSETS: PortfolioAsset[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, purchasePrice: 150.00, currentPrice: 178.50, sector: 'Technology', market: 'NASDAQ' },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 30, purchasePrice: 280.00, currentPrice: 415.20, sector: 'Technology', market: 'NASDAQ' },
  { id: '3', symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 20, purchasePrice: 120.00, currentPrice: 175.80, sector: 'Technology', market: 'NASDAQ' },
  { id: '4', symbol: 'JPM', name: 'JPMorgan Chase & Co.', quantity: 40, purchasePrice: 140.00, currentPrice: 198.30, sector: 'Financial Services', market: 'NYSE' },
  { id: '5', symbol: 'JNJ', name: 'Johnson & Johnson', quantity: 25, purchasePrice: 160.00, currentPrice: 155.40, sector: 'Healthcare', market: 'NYSE' },
];

const getDemoPortfolio = (): PortfolioSummary => {
  const totalValue = DEMO_ASSETS.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  const totalCost = DEMO_ASSETS.reduce((sum, a) => sum + a.quantity * a.purchasePrice, 0);
  const totalGain = totalValue - totalCost;
  return {
    totalValue,
    totalGain,
    totalGainPercent: (totalGain / totalCost) * 100,
    assets: DEMO_ASSETS,
  };
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: null,
  performanceHistory: [],
  isLoading: false,

  fetchPortfolio: async () => {
    set({ isLoading: true });

    if (isDemoMode) {
      set({ portfolio: getDemoPortfolio(), isLoading: false });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ portfolio: null, isLoading: false });
        return;
      }

      const { data: assets, error } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const portfolioAssets: PortfolioAsset[] = assets?.map((asset) => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        quantity: asset.quantity,
        purchasePrice: asset.purchase_price,
        currentPrice: asset.current_price,
        sector: asset.sector,
        market: asset.market,
      })) || [];

      const totalValue = portfolioAssets.reduce(
        (sum, asset) => sum + asset.quantity * asset.currentPrice,
        0
      );
      const totalCost = portfolioAssets.reduce(
        (sum, asset) => sum + asset.quantity * asset.purchasePrice,
        0
      );
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

      set({
        portfolio: {
          totalValue,
          totalGain,
          totalGainPercent,
          assets: portfolioAssets,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch portfolio error:', error);
      set({ portfolio: null, isLoading: false });
    }
  },

  fetchPerformanceHistory: async () => {
    if (isDemoMode) {
      set({ performanceHistory: generatePerformanceHistory() });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ performanceHistory: [] });
        return;
      }

      const { data: performance, error } = await supabase
        .from('portfolio_performance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      if (performance && performance.length > 0) {
        const performanceData: PerformanceData[] = performance.map((p) => ({
          date: p.date,
          value: p.value,
        }));
        set({ performanceHistory: performanceData });
      } else {
        // Fallback to generated data if no performance history exists
        set({ performanceHistory: generatePerformanceHistory() });
      }
    } catch (error) {
      console.error('Fetch performance history error:', error);
      // Fallback to generated data on error
      set({ performanceHistory: generatePerformanceHistory() });
    }
  },
}));
