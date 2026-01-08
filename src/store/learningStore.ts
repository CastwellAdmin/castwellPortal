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
    content: 'Learn the fundamentals of stock market investing...',
    category: 'Markets Basics',
    tags: ['stocks', 'investing', 'beginner'],
    author: 'Castwell Team',
    publishDate: '2025-01-05',
    readTime: 5,
  },
  {
    id: '2',
    title: 'Sector Analysis: Technology in 2025',
    slug: 'sector-analysis-technology-2025',
    content: 'Deep dive into the technology sector performance...',
    category: 'Sector Insights',
    tags: ['technology', 'sectors', 'analysis'],
    author: 'Castwell Team',
    publishDate: '2025-01-03',
    readTime: 8,
  },
  {
    id: '3',
    title: 'Portfolio Diversification Strategies',
    slug: 'portfolio-diversification-strategies',
    content: 'Learn how to build a well-diversified investment portfolio...',
    category: 'Investment Tips',
    tags: ['portfolio', 'diversification', 'strategy'],
    author: 'Castwell Team',
    publishDate: '2024-12-30',
    readTime: 6,
  },
];

const MOCK_CATEGORIES: ArticleCategory[] = [
  {
    id: '1',
    name: 'Markets Basics',
    description: 'Fundamental concepts of market investing',
    articleCount: 12,
  },
  {
    id: '2',
    name: 'Sector Insights',
    description: 'Analysis and trends across different sectors',
    articleCount: 8,
  },
  {
    id: '3',
    name: 'Investment Tips',
    description: 'Practical advice for better investment decisions',
    articleCount: 15,
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
