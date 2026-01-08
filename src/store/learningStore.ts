import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Article, ArticleCategory } from '../types';

interface LearningState {
  articles: Article[];
  categories: ArticleCategory[];
  selectedArticle: Article | null;
  isLoading: boolean;
  fetchArticles: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getArticleBySlug: (slug: string) => Article | undefined;
  createArticle: (article: Omit<Article, 'id' | 'publishDate'>) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
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

    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;

      const articleList: Article[] = articles?.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        category: article.category,
        tags: article.tags,
        author: article.author,
        publishDate: article.publish_date,
        readTime: article.read_time,
      })) || [];

      set({ articles: articleList, isLoading: false });
    } catch (error) {
      console.error('Fetch articles error:', error);
      // Fallback to mock data if Supabase fails
      set({ articles: MOCK_ARTICLES, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data: categories, error } = await supabase
        .from('article_categories')
        .select('*');

      if (error) throw error;

      const categoryList: ArticleCategory[] = categories?.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        articleCount: cat.article_count,
      })) || [];

      set({ categories: categoryList });
    } catch (error) {
      console.error('Fetch categories error:', error);
      // Fallback to mock data if Supabase fails
      set({ categories: MOCK_CATEGORIES });
    }
  },

  getArticleBySlug: (slug: string) => {
    return get().articles.find((article) => article.slug === slug);
  },

  createArticle: async (article: Omit<Article, 'id' | 'publishDate'>) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug: article.slug,
          content: article.content,
          category: article.category,
          tags: article.tags,
          author: article.author,
          read_time: article.readTime,
          publish_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newArticle: Article = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          content: data.content,
          category: data.category,
          tags: data.tags,
          author: data.author,
          publishDate: data.publish_date,
          readTime: data.read_time,
        };
        set((state) => ({ articles: [...state.articles, newArticle] }));
      }
    } catch (error) {
      console.error('Create article error:', error);
    }
  },

  updateArticle: async (id: string, articleData: Partial<Article>) => {
    try {
      const updateData: any = {};
      if (articleData.title) updateData.title = articleData.title;
      if (articleData.slug) updateData.slug = articleData.slug;
      if (articleData.content) updateData.content = articleData.content;
      if (articleData.category) updateData.category = articleData.category;
      if (articleData.tags) updateData.tags = articleData.tags;
      if (articleData.author) updateData.author = articleData.author;
      if (articleData.readTime) updateData.read_time = articleData.readTime;

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        articles: state.articles.map((article) =>
          article.id === id ? { ...article, ...articleData } : article
        ),
      }));
    } catch (error) {
      console.error('Update article error:', error);
    }
  },

  deleteArticle: async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        articles: state.articles.filter((article) => article.id !== id),
      }));
    } catch (error) {
      console.error('Delete article error:', error);
    }
  },
}));
