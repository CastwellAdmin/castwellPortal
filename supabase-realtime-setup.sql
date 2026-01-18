-- Additional tables and real-time setup for Castwell Portal
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql

-- =====================================================
-- PORTFOLIO PERFORMANCE HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portfolio_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  gain DECIMAL(12, 2) DEFAULT 0,
  gain_percent DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for faster queries
CREATE INDEX idx_portfolio_performance_user_date ON public.portfolio_performance(user_id, date);

-- =====================================================
-- WATCHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker_id UUID REFERENCES public.market_tickers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker_id)
);

-- =====================================================
-- PORTFOLIO VIEW WITH COMPUTED COLUMNS
-- =====================================================
CREATE OR REPLACE VIEW public.portfolio_assets_detailed AS
SELECT
  pa.id,
  pa.user_id,
  pa.ticker_id,
  pa.quantity,
  pa.purchase_price,
  pa.purchase_date,
  mt.symbol,
  mt.name,
  mt.price as current_price,
  mt.sector,
  mt.market,
  (pa.quantity * mt.price) as current_value,
  (pa.quantity * pa.purchase_price) as cost_basis,
  (pa.quantity * mt.price) - (pa.quantity * pa.purchase_price) as gain,
  CASE
    WHEN pa.purchase_price > 0 THEN
      ((mt.price - pa.purchase_price) / pa.purchase_price * 100)
    ELSE 0
  END as gain_percent,
  pa.created_at,
  pa.updated_at
FROM public.portfolio_assets pa
INNER JOIN public.market_tickers mt ON pa.ticker_id = mt.id;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/update their own profile, admins can see all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Portfolio Assets: Users can only see their own assets
CREATE POLICY "Users can view own portfolio" ON public.portfolio_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio" ON public.portfolio_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" ON public.portfolio_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio" ON public.portfolio_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Portfolio Performance: Users can only see their own performance
CREATE POLICY "Users can view own performance" ON public.portfolio_performance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert performance" ON public.portfolio_performance
  FOR INSERT WITH CHECK (true);

-- Documents: Users can see assigned documents, admins can see all
CREATE POLICY "Users can view assigned documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_assignments
      WHERE document_id = id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
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

-- Payments: Users can only see their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Watchlist: Users can manage their own watchlist
CREATE POLICY "Users can view own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC PORTFOLIO PERFORMANCE TRACKING
-- =====================================================

-- Function to calculate and store daily portfolio performance
CREATE OR REPLACE FUNCTION public.calculate_portfolio_performance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  total_value DECIMAL(12, 2);
  total_cost DECIMAL(12, 2);
  gain_value DECIMAL(12, 2);
  gain_pct DECIMAL(5, 2);
BEGIN
  -- Loop through all users with portfolio assets
  FOR user_record IN
    SELECT DISTINCT user_id FROM public.portfolio_assets
  LOOP
    -- Calculate total current value
    SELECT COALESCE(SUM(pa.quantity * mt.price), 0)
    INTO total_value
    FROM public.portfolio_assets pa
    INNER JOIN public.market_tickers mt ON pa.ticker_id = mt.id
    WHERE pa.user_id = user_record.user_id;

    -- Calculate total cost basis
    SELECT COALESCE(SUM(pa.quantity * pa.purchase_price), 0)
    INTO total_cost
    FROM public.portfolio_assets pa
    WHERE pa.user_id = user_record.user_id;

    -- Calculate gains
    gain_value := total_value - total_cost;
    gain_pct := CASE WHEN total_cost > 0 THEN (gain_value / total_cost * 100) ELSE 0 END;

    -- Insert or update today's performance
    INSERT INTO public.portfolio_performance (user_id, date, value, gain, gain_percent)
    VALUES (user_record.user_id, CURRENT_DATE, total_value, gain_value, gain_pct)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      value = EXCLUDED.value,
      gain = EXCLUDED.gain,
      gain_percent = EXCLUDED.gain_percent;
  END LOOP;
END;
$$;

-- =====================================================
-- ENABLE REALTIME FOR TABLES
-- =====================================================
-- This allows Supabase to send real-time updates to clients

ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_performance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_tickers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watchlist;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers to tables that have updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.portfolio_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.market_tickers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON public.market_tickers TO authenticated;
GRANT SELECT ON public.article_categories TO authenticated;
GRANT SELECT ON public.articles TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.portfolio_assets TO authenticated;
GRANT SELECT ON public.portfolio_performance TO authenticated;
GRANT SELECT, INSERT ON public.portfolio_performance TO service_role;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.document_assignments TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.watchlist TO authenticated;

-- Grant access to the portfolio view
GRANT SELECT ON public.portfolio_assets_detailed TO authenticated;

COMMENT ON TABLE public.portfolio_performance IS 'Tracks historical portfolio value for each user';
COMMENT ON TABLE public.watchlist IS 'User watchlist for tracking favorite stocks';
COMMENT ON VIEW public.portfolio_assets_detailed IS 'Portfolio assets with computed gain/loss values';
COMMENT ON FUNCTION public.calculate_portfolio_performance IS 'Calculates and stores daily portfolio performance for all users';
