// Supabase Database Types
// This file contains type definitions that match your database schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'user' | 'admin';
          is_active: boolean;
          created_at: string;
          last_login: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'user' | 'admin';
          is_active?: boolean;
          created_at?: string;
          last_login?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'user' | 'admin';
          is_active?: boolean;
          last_login?: string | null;
          updated_at?: string;
        };
      };
      market_tickers: {
        Row: {
          id: string;
          symbol: string;
          name: string;
          price: number;
          change: number;
          change_percent: number;
          sector: string;
          market: string;
          volume: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          name: string;
          price: number;
          change?: number;
          change_percent?: number;
          sector: string;
          market: string;
          volume?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          symbol?: string;
          name?: string;
          price?: number;
          change?: number;
          change_percent?: number;
          sector?: string;
          market?: string;
          volume?: number;
          updated_at?: string;
        };
      };
      portfolio_assets: {
        Row: {
          id: string;
          user_id: string;
          ticker_id: string;
          quantity: number;
          purchase_price: number;
          purchase_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker_id: string;
          quantity: number;
          purchase_price: number;
          purchase_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          purchase_price?: number;
          purchase_date?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          type: 'pdf' | 'docx';
          upload_date: string;
          size: number;
          status: 'pending' | 'viewed' | 'signed';
          requires_signature: boolean;
          signed_date: string | null;
          url: string;
          storage_path: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: 'pdf' | 'docx';
          upload_date?: string;
          size: number;
          status?: 'pending' | 'viewed' | 'signed';
          requires_signature?: boolean;
          signed_date?: string | null;
          url: string;
          storage_path?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          status?: 'pending' | 'viewed' | 'signed';
          signed_date?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          type: 'deposit' | 'withdrawal' | 'dividend' | 'fee';
          status: 'completed' | 'pending' | 'failed';
          description: string;
          reference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          amount: number;
          type: 'deposit' | 'withdrawal' | 'dividend' | 'fee';
          status?: 'completed' | 'pending' | 'failed';
          description: string;
          reference: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'completed' | 'pending' | 'failed';
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          category_id: string | null;
          category_name: string | null;
          tags: string[];
          author: string;
          publish_date: string;
          read_time: number;
          cover_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          category_id?: string | null;
          category_name?: string | null;
          tags?: string[];
          author: string;
          publish_date?: string;
          read_time: number;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          category_id?: string | null;
          category_name?: string | null;
          tags?: string[];
          author?: string;
          read_time?: number;
          cover_image?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
