-- Castwell Portal - Supabase Database Setup
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/wlsjbouwykyoyxzljkvl/sql

-- ============================================
-- 1. PROFILES TABLE (linked to Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 2. ARTICLES TABLE (Learning Center)
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'Castwell Research Team',
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_time INTEGER NOT NULL DEFAULT 5,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read articles
CREATE POLICY "Authenticated users can read articles" ON articles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage articles
CREATE POLICY "Admins can manage articles" ON articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow anonymous read for public articles
CREATE POLICY "Public can read articles" ON articles
  FOR SELECT USING (true);

-- ============================================
-- 3. ARTICLE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  article_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON article_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON article_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 4. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'docx')),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  size INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('viewed', 'signed', 'pending')),
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  signed_date DATE,
  assigned_users TEXT[] DEFAULT '{}',
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all documents" ON documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view assigned documents" ON documents
  FOR SELECT USING (
    auth.uid()::text = ANY(assigned_users)
  );

-- ============================================
-- 5. PORTFOLIO ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC NOT NULL DEFAULT 0,
  sector TEXT,
  market TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON portfolio_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all portfolios" ON portfolio_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 6. PORTFOLIO PERFORMANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance" ON portfolio_performance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all performance" ON portfolio_performance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 7. SEED DATA - Sample Articles
-- ============================================
INSERT INTO articles (title, slug, content, category, tags, author, publish_date, read_time)
VALUES
  ('Understanding Stock Market Basics', 'understanding-stock-market-basics',
   'The stock market is a platform where shares of publicly traded companies are bought and sold. Understanding how it works is crucial for successful investing. Markets operate through exchanges like NYSE and NASDAQ, where buyers and sellers meet to trade securities.',
   'Market Fundamentals', ARRAY['stocks', 'markets', 'beginner'], 'Castwell Research Team', '2025-01-05', 5),

  ('Technology Sector Performance Analysis 2025', 'tech-sector-analysis-2025',
   'The technology sector continues to lead market performance in 2025. Key drivers include AI development, cloud computing expansion, and semiconductor demand. Major players like AAPL, MSFT, and GOOGL show strong fundamentals.',
   'Market Sectors', ARRAY['technology', 'sectors', 'analysis'], 'Castwell Research Team', '2025-01-03', 8),

  ('How to Read Market Indicators', 'reading-market-indicators',
   'Market indicators like moving averages, RSI, and MACD help investors understand market trends and make informed decisions. Learn how to interpret these signals and apply them to your investment strategy.',
   'Market Analysis', ARRAY['indicators', 'analysis', 'technical'], 'Castwell Research Team', '2024-12-30', 6),

  ('Understanding Market Volatility', 'understanding-market-volatility',
   'Market volatility refers to the rate at which stock prices fluctuate. High volatility means rapid price changes, while low volatility indicates stable prices. Understanding volatility helps manage risk and set appropriate expectations.',
   'Market Fundamentals', ARRAY['volatility', 'risk', 'markets'], 'Castwell Research Team', '2024-12-28', 7)
ON CONFLICT (slug) DO NOTHING;

-- Seed categories
INSERT INTO article_categories (name, description, article_count)
VALUES
  ('Market Fundamentals', 'Core concepts of how markets operate', 8),
  ('Market Sectors', 'Analysis of different market sectors and industries', 12),
  ('Market Analysis', 'Technical and fundamental analysis techniques', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, is_active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    true,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
