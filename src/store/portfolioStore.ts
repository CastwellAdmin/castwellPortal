import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { PortfolioAsset, PortfolioSummary, PerformanceData } from '../types';

interface PortfolioState {
  portfolio: PortfolioSummary | null;
  performanceHistory: PerformanceData[];
  isLoading: boolean;
  fetchPortfolio: () => Promise<void>;
  fetchPerformanceHistory: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: null,
  performanceHistory: [],
  isLoading: false,

  fetchPortfolio: async () => {
    set({ isLoading: true });

    try {
      const user = useAuthStore.getState().user;

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
    try {
      const user = useAuthStore.getState().user;

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
        set({ performanceHistory: [] });
      }
    } catch (error) {
      console.error('Fetch performance history error:', error);
      set({ performanceHistory: [] });
    }
  },
}));
