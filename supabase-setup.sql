-- Castwell Portal Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MARKET TICKERS
-- =====================================================
CREATE TABLE public.market_tickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  change DECIMAL(10, 2) DEFAULT 0,
  change_percent DECIMAL(5, 2) DEFAULT 0,
  sector TEXT NOT NULL,
  market TEXT NOT NULL,
  volume BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRICE HISTORY
-- =====================================================
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker_id UUID REFERENCES public.market_tickers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open DECIMAL(10, 2) NOT NULL,
  high DECIMAL(10, 2) NOT NULL,
  low DECIMAL(10, 2) NOT NULL,
  close DECIMAL(10, 2) NOT NULL,
  volume BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticker_id, date)
);

-- =====================================================
-- PORTFOLIO ASSETS
-- =====================================================
CREATE TABLE public.portfolio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker_id UUID REFERENCES public.market_tickers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DOCUMENTS
-- =====================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'docx')),
  upload_date DATE DEFAULT CURRENT_DATE,
  size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'signed')),
  requires_signature BOOLEAN DEFAULT false,
  signed_date DATE,
  url TEXT NOT NULL,
  storage_path TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT ASSIGNMENTS (Many-to-Many)
-- =====================================================
CREATE TABLE public.document_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'dividend', 'fee')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  description TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARTICLE CATEGORIES
-- =====================================================
CREATE TABLE public.article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARTICLES
-- =====================================================
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
  category_name TEXT, -- Denormalized for easier queries
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL,
  publish_date DATE DEFAULT CURRENT_DATE,
  read_time INTEGER NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PLATFORM SETTINGS
-- =====================================================
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Market Tickers: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view tickers" ON public.market_tickers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tickers" ON public.market_tickers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Price History: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view price history" ON public.price_history
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage price history" ON public.price_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Portfolio Assets: Users can view their own, admins can view all
CREATE POLICY "Users can view own assets" ON public.portfolio_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assets" ON public.portfolio_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage assets" ON public.portfolio_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents: Users can view assigned docs, admins can view all
CREATE POLICY "Users can view assigned documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_assignments
      WHERE document_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Document Assignments
CREATE POLICY "Users can view own assignments" ON public.document_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage assignments" ON public.document_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments: Users can view their own, admins can view all
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Articles: Everyone can read, admins can manage
CREATE POLICY "Anyone can view articles" ON public.articles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage articles" ON public.articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Article Categories: Everyone can read, admins can manage
CREATE POLICY "Anyone can view categories" ON public.article_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.article_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit Logs: Only admins can view
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Platform Settings: Only admins
CREATE POLICY "Admins can manage settings" ON public.platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.market_tickers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.portfolio_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.article_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE INDEX idx_market_tickers_symbol ON public.market_tickers(symbol);
CREATE INDEX idx_market_tickers_sector ON public.market_tickers(sector);

CREATE INDEX idx_price_history_ticker ON public.price_history(ticker_id, date DESC);

CREATE INDEX idx_portfolio_assets_user ON public.portfolio_assets(user_id);
CREATE INDEX idx_portfolio_assets_ticker ON public.portfolio_assets(ticker_id);

CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_document_assignments_user ON public.document_assignments(user_id);
CREATE INDEX idx_document_assignments_doc ON public.document_assignments(document_id);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_date ON public.payments(date DESC);

CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_publish_date ON public.articles(publish_date DESC);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert default article categories
INSERT INTO public.article_categories (name, description) VALUES
  ('Markets Basics', 'Fundamental concepts of market investing'),
  ('Sector Insights', 'Analysis and trends across different sectors'),
  ('Investment Tips', 'Practical advice for better investment decisions')
ON CONFLICT (name) DO NOTHING;

-- Insert sample market tickers
INSERT INTO public.market_tickers (symbol, name, price, change, change_percent, sector, market, volume) VALUES
  ('AAPL', 'Apple Inc.', 178.50, 2.30, 1.31, 'Technology', 'NASDAQ', 52340000),
  ('MSFT', 'Microsoft Corporation', 378.90, -1.20, -0.32, 'Technology', 'NASDAQ', 23450000),
  ('GOOGL', 'Alphabet Inc.', 142.80, 0.80, 0.56, 'Technology', 'NASDAQ', 18920000),
  ('TSLA', 'Tesla Inc.', 242.10, 5.40, 2.28, 'Automotive', 'NASDAQ', 98760000),
  ('JPM', 'JPMorgan Chase & Co.', 168.20, 1.50, 0.90, 'Financial Services', 'NYSE', 12340000),
  ('JNJ', 'Johnson & Johnson', 155.80, -0.60, -0.38, 'Healthcare', 'NYSE', 8760000)
ON CONFLICT (symbol) DO NOTHING;

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('platform_name', '"Castwell Portal"'),
  ('support_email', '"support@castwell.com"'),
  ('max_upload_size_mb', '10'),
  ('session_timeout_minutes', '30'),
  ('enable_notifications', 'true'),
  ('enable_two_factor', 'false'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STORAGE BUCKET FOR DOCUMENTS (Run in Supabase Dashboard)
-- =====================================================
-- You'll need to create a storage bucket called 'documents' in the Supabase dashboard
-- and set appropriate policies for file uploads/downloads
