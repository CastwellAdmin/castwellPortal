// User types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Portfolio types
export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  sector: string;
  market: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  assets: PortfolioAsset[];
}

export interface PerformanceData {
  date: string;
  value: number;
}

// Market types
export interface StockTicker {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  market: string;
  volume: number;
}

export interface MarketSector {
  name: string;
  performance: number;
  volume: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Document types
export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'docx';
  uploadDate: string;
  size: number;
  status: 'viewed' | 'signed' | 'pending';
  requiresSignature: boolean;
  signedDate?: string;
  assignedUsers: string[];
  url: string;
}

// Payment types
export interface Payment {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'dividend' | 'fee';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference: string;
}

// Learning Center types
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
  readTime: number;
  coverImage?: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  description: string;
  articleCount: number;
}

// Admin types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalTransactions: number;
  totalVolume: number;
}
