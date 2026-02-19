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
      set({ articles: [], isLoading: false });
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
      set({ categories: [] });
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
