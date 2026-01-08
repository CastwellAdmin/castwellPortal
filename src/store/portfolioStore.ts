import { create } from 'zustand';
import type { PortfolioAsset, PortfolioSummary, PerformanceData } from '../types';

interface PortfolioState {
  portfolio: PortfolioSummary | null;
  performanceHistory: PerformanceData[];
  isLoading: boolean;
  fetchPortfolio: () => Promise<void>;
  fetchPerformanceHistory: () => Promise<void>;
}

// Mock data
const MOCK_ASSETS: PortfolioAsset[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 50,
    purchasePrice: 150,
    currentPrice: 178.5,
    sector: 'Technology',
    market: 'NASDAQ',
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    quantity: 30,
    purchasePrice: 310,
    currentPrice: 378.9,
    sector: 'Technology',
    market: 'NASDAQ',
  },
  {
    id: '3',
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    quantity: 25,
    purchasePrice: 140,
    currentPrice: 168.2,
    sector: 'Financial Services',
    market: 'NYSE',
  },
  {
    id: '4',
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    quantity: 40,
    purchasePrice: 160,
    currentPrice: 155.8,
    sector: 'Healthcare',
    market: 'NYSE',
  },
];

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

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: null,
  performanceHistory: [],
  isLoading: false,

  fetchPortfolio: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const totalValue = MOCK_ASSETS.reduce(
      (sum, asset) => sum + asset.quantity * asset.currentPrice,
      0
    );
    const totalCost = MOCK_ASSETS.reduce(
      (sum, asset) => sum + asset.quantity * asset.purchasePrice,
      0
    );
    const totalGain = totalValue - totalCost;
    const totalGainPercent = (totalGain / totalCost) * 100;

    set({
      portfolio: {
        totalValue,
        totalGain,
        totalGainPercent,
        assets: MOCK_ASSETS,
      },
      isLoading: false,
    });
  },

  fetchPerformanceHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({
      performanceHistory: generatePerformanceHistory(),
    });
  },
}));
