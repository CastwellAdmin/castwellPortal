# Castwell Portal - Real-Time Setup Guide

## Step 1: Run the SQL Scripts in Supabase

### 1.1 Go to Supabase SQL Editor
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### 1.2 Run the Main Setup (if not done already)
1. Copy the contents of `supabase-setup.sql`
2. Paste into SQL Editor
3. Click "Run"
4. Wait for completion (should say "Success")

### 1.3 Run the Real-Time Setup
1. Copy the contents of `supabase-realtime-setup.sql`
2. Paste into SQL Editor
3. Click "Run"
4. Wait for completion

## Step 2: Enable Realtime in Supabase Dashboard

### 2.1 Go to Database Settings
1. In Supabase, click "Database" in the left sidebar
2. Click "Replication" tab

### 2.2 Enable Realtime for Tables
Make sure these tables are enabled for Realtime:
- ✅ `portfolio_assets`
- ✅ `portfolio_performance`
- ✅ `market_tickers`
- ✅ `documents`
- ✅ `payments`
- ✅ `watchlist`

Toggle the switch next to each table to enable Realtime.

## Step 3: Create Test Users

Run this SQL to create test users:

```sql
-- Create test admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@castwell.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Create admin profile
INSERT INTO public.profiles (id, email, name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@castwell.com',
  'Admin User',
  'admin',
  true
);

-- Create test regular user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'user@castwell.com',
  crypt('user123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Create user profile
INSERT INTO public.profiles (id, email, name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'user@castwell.com',
  'Test User',
  'user',
  true
);
```

## Step 4: Add Sample Data

### 4.1 Add Market Tickers

```sql
-- Insert sample stock tickers
INSERT INTO public.market_tickers (symbol, name, price, change, change_percent, sector, market, volume)
VALUES
  ('AAPL', 'Apple Inc.', 178.25, 2.50, 1.42, 'Technology', 'NASDAQ', 45000000),
  ('GOOGL', 'Alphabet Inc.', 141.80, -1.20, -0.84, 'Technology', 'NASDAQ', 28000000),
  ('MSFT', 'Microsoft Corporation', 378.50, 5.25, 1.41, 'Technology', 'NASDAQ', 32000000),
  ('TSLA', 'Tesla Inc.', 242.15, -3.80, -1.55, 'Automotive', 'NASDAQ', 95000000),
  ('AMZN', 'Amazon.com Inc.', 151.75, 2.10, 1.40, 'E-commerce', 'NASDAQ', 41000000),
  ('NVDA', 'NVIDIA Corporation', 495.20, 8.75, 1.80, 'Technology', 'NASDAQ', 52000000),
  ('META', 'Meta Platforms Inc.', 485.30, 6.50, 1.36, 'Technology', 'NASDAQ', 18000000),
  ('BRK.B', 'Berkshire Hathaway', 378.90, 1.50, 0.40, 'Financials', 'NYSE', 3000000),
  ('JPM', 'JPMorgan Chase', 165.40, -0.80, -0.48, 'Financials', 'NYSE', 12000000),
  ('JNJ', 'Johnson & Johnson', 158.70, 0.90, 0.57, 'Healthcare', 'NYSE', 7500000);
```

### 4.2 Add Sample Portfolio for Test User

```sql
-- Get ticker IDs (you'll need to replace these with actual IDs from your database)
-- First, let's get the IDs:
SELECT id, symbol FROM public.market_tickers WHERE symbol IN ('AAPL', 'GOOGL', 'MSFT');

-- Then insert portfolio assets (replace the ticker_id UUIDs with actual ones from above)
INSERT INTO public.portfolio_assets (user_id, ticker_id, quantity, purchase_price, purchase_date)
VALUES
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM public.market_tickers WHERE symbol = 'AAPL'), 100, 150.00, '2024-01-15'),
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM public.market_tickers WHERE symbol = 'GOOGL'), 50, 125.00, '2024-02-01'),
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM public.market_tickers WHERE symbol = 'MSFT'), 75, 340.00, '2024-03-10');
```

### 4.3 Generate Portfolio Performance History

```sql
-- Calculate initial performance
SELECT public.calculate_portfolio_performance();
```

## Step 5: Test Real-Time Updates

### 5.1 Login to Your App
- Email: `user@castwell.com`
- Password: `user123`

### 5.2 Open Supabase SQL Editor in Another Tab
Run this to update a stock price:

```sql
UPDATE public.market_tickers
SET price = 180.00, change = 4.25, change_percent = 2.41
WHERE symbol = 'AAPL';
```

### 5.3 Watch Your App Update in Real-Time
Your portfolio should automatically update without refreshing!

## Step 6: Schedule Daily Performance Calculations

In Supabase, go to "Database" → "Functions" and create a cron job:

```sql
-- Run this once a day at midnight to calculate performance
SELECT cron.schedule(
  'calculate-daily-performance',
  '0 0 * * *', -- Daily at midnight
  $$SELECT public.calculate_portfolio_performance()$$
);
```

## Troubleshooting

### Issue: "permission denied for table"
**Solution:** Re-run the GRANT statements in `supabase-realtime-setup.sql`

### Issue: Real-time not working
**Solution:**
1. Check that tables are enabled in Database → Replication
2. Verify your `.env` has correct Supabase credentials
3. Check browser console for WebSocket errors

### Issue: No performance data showing
**Solution:** Run `SELECT public.calculate_portfolio_performance();` manually

## What's Now Real-Time:

✅ **Portfolio Values** - Updates when market prices change
✅ **Market Prices** - Live ticker updates
✅ **Documents** - New documents appear instantly
✅ **Payments** - Payment status updates in real-time
✅ **User Profiles** - Profile changes sync immediately

No more mock data - everything is 100% real Supabase data!
