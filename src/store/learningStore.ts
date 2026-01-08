import { create } from 'zustand';
import type { Article, ArticleCategory } from '../types';

interface LearningState {
  articles: Article[];
  categories: ArticleCategory[];
  selectedArticle: Article | null;
  isLoading: boolean;
  fetchArticles: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getArticleBySlug: (slug: string) => Article | undefined;
  createArticle: (article: Omit<Article, 'id' | 'publishDate'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
}

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding Stock Market Basics',
    slug: 'understanding-stock-market-basics',
    content: 'The stock market is a platform where shares of publicly traded companies are bought and sold. Understanding how it works is crucial for successful investing. Markets operate through exchanges like NYSE and NASDAQ, where buyers and sellers meet to trade securities.',
    category: 'Market Fundamentals',
    tags: ['stocks', 'markets', 'beginner'],
    author: 'Castwell Research Team',
    publishDate: '2025-01-05',
    readTime: 5,
  },
  {
    id: '2',
    title: 'Technology Sector Performance Analysis 2025',
    slug: 'tech-sector-analysis-2025',
    content: 'The technology sector continues to lead market performance in 2025. Key drivers include AI development, cloud computing expansion, and semiconductor demand. Major players like AAPL, MSFT, and GOOGL show strong fundamentals.',
    category: 'Market Sectors',
    tags: ['technology', 'sectors', 'analysis'],
    author: 'Castwell Research Team',
    publishDate: '2025-01-03',
    readTime: 8,
  },
  {
    id: '3',
    title: 'How to Read Market Indicators',
    slug: 'reading-market-indicators',
    content: 'Market indicators like moving averages, RSI, and MACD help investors understand market trends and make informed decisions. Learn how to interpret these signals and apply them to your investment strategy.',
    category: 'Market Analysis',
    tags: ['indicators', 'analysis', 'technical'],
    author: 'Castwell Research Team',
    publishDate: '2024-12-30',
    readTime: 6,
  },
  {
    id: '4',
    title: 'Understanding Market Volatility',
    slug: 'understanding-market-volatility',
    content: 'Market volatility refers to the rate at which stock prices fluctuate. High volatility means rapid price changes, while low volatility indicates stable prices. Understanding volatility helps manage risk and set appropriate expectations.',
    category: 'Market Fundamentals',
    tags: ['volatility', 'risk', 'markets'],
    author: 'Castwell Research Team',
    publishDate: '2024-12-28',
    readTime: 7,
  },
];

const MOCK_CATEGORIES: ArticleCategory[] = [
  {
    id: '1',
    name: 'Market Fundamentals',
    description: 'Core concepts of how markets operate',
    articleCount: 8,
  },
  {
    id: '2',
    name: 'Market Sectors',
    description: 'Analysis of different market sectors and industries',
    articleCount: 12,
  },
  {
    id: '3',
    name: 'Market Analysis',
    description: 'Technical and fundamental analysis techniques',
    articleCount: 10,
  },
];

export const useLearningStore = create<LearningState>((set, get) => ({
  articles: [],
  categories: [],
  selectedArticle: null,
  isLoading: false,

  fetchArticles: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ articles: MOCK_ARTICLES, isLoading: false });
  },

  fetchCategories: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ categories: MOCK_CATEGORIES });
  },

  getArticleBySlug: (slug: string) => {
    return get().articles.find((article) => article.slug === slug);
  },

  createArticle: (article: Omit<Article, 'id' | 'publishDate'>) => {
    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      publishDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ articles: [...state.articles, newArticle] }));
  },

  updateArticle: (id: string, articleData: Partial<Article>) => {
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === id ? { ...article, ...articleData } : article
      ),
    }));
  },

  deleteArticle: (id: string) => {
    set((state) => ({
      articles: state.articles.filter((article) => article.id !== id),
    }));
  },
}));
