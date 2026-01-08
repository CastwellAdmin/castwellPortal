# Supabase Integration Guide

Complete guide to integrating your Castwell Portal with Supabase backend.

## 📋 Prerequisites

- Supabase account (https://supabase.com)
- Node.js and npm installed
- Project already built and running locally

---

## 🚀 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: Castwell Portal
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup (~2 minutes)

---

### 2. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-setup.sql`
4. Paste into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`
6. Wait for success message

**What this does:**
- ✅ Creates all database tables
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates automatic triggers
- ✅ Adds performance indexes
- ✅ Inserts seed data (sample tickers, categories)

---

### 3. Set Up Storage Bucket for Documents

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `documents`
4. Make it **private** (not public)
5. Click "Create bucket"

**Set up storage policies:**

```sql
-- Allow authenticated users to upload documents (admins only)
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow users to download their assigned documents
CREATE POLICY "Users can download assigned documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.documents d
    JOIN public.document_assignments da ON d.id = da.document_id
    WHERE d.storage_path = name AND da.user_id = auth.uid()
  )
);

-- Allow admins to download all documents
CREATE POLICY "Admins can download all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

### 4. Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** tab
3. Copy these values:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

---

### 5. Configure Frontend Environment

1. In your project root, create `.env` file:

```bash
cp .env.example .env
```

2. Edit `.env` and add your keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Add `.env` to `.gitignore` (already done):

```
.env
.env.local
```

---

### 6. Create Admin User

**Option A: Using Supabase Dashboard**

1. Go to **Authentication** > **Users**
2. Click "Add user" > "Create new user"
3. Enter email and password
4. Click "Create user"
5. Go to **SQL Editor** and run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

**Option B: Using Sign Up Flow**

1. Run your app: `npm run dev`
2. The sign up will create a regular user
3. Manually update role in database as shown above

---

### 7. Update Authentication Store (Supabase Integration)

Replace `src/store/authStore.ts` with Supabase-connected version:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              // Update last login
              await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', profile.id);

              set({
                user: {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  role: profile.role,
                  createdAt: profile.created_at,
                  lastLogin: new Date().toISOString(),
                  isActive: profile.is_active,
                },
                isAuthenticated: true,
              });
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      signUp: async (email: string, password: string, name: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role: 'user',
              },
            },
          });

          if (error) throw error;
          return !!data.user;
        } catch (error) {
          console.error('Sign up error:', error);
          return false;
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      checkSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  role: profile.role,
                  createdAt: profile.created_at,
                  lastLogin: profile.last_login,
                  isActive: profile.is_active,
                },
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }

          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Session check error:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize session check on app load
useAuthStore.getState().checkSession();
```

---

### 8. Example: Update Market Store for Supabase

```typescript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { StockTicker, MarketSector, PriceHistory } from '../types';

interface MarketState {
  tickers: StockTicker[];
  sectors: MarketSector[];
  selectedTicker: StockTicker | null;
  priceHistory: PriceHistory[];
  isLoading: boolean;
  fetchTickers: () => Promise<void>;
  fetchSectors: () => Promise<void>;
  fetchPriceHistory: (symbol: string) => Promise<void>;
  addTicker: (ticker: Omit<StockTicker, 'id'>) => Promise<void>;
  removeTicker: (id: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  tickers: [],
  sectors: [],
  selectedTicker: null,
  priceHistory: [],
  isLoading: false,

  fetchTickers: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('market_tickers')
      .select('*')
      .order('symbol', { ascending: true });

    if (data && !error) {
      set({
        tickers: data.map((t) => ({
          id: t.id,
          symbol: t.symbol,
          name: t.name,
          price: Number(t.price),
          change: Number(t.change),
          changePercent: Number(t.change_percent),
          sector: t.sector,
          market: t.market,
          volume: t.volume,
        })),
      });
    }

    set({ isLoading: false });
  },

  fetchSectors: async () => {
    const { data } = await supabase
      .from('market_tickers')
      .select('sector, volume, change_percent');

    if (data) {
      const sectorMap = new Map<string, { volume: number; performances: number[] }>();

      data.forEach((ticker) => {
        const existing = sectorMap.get(ticker.sector) || { volume: 0, performances: [] };
        existing.volume += ticker.volume;
        existing.performances.push(Number(ticker.change_percent));
        sectorMap.set(ticker.sector, existing);
      });

      const sectors: MarketSector[] = Array.from(sectorMap.entries()).map(
        ([name, { volume, performances }]) => ({
          name,
          performance: performances.reduce((a, b) => a + b, 0) / performances.length,
          volume,
        })
      );

      set({ sectors });
    }
  },

  fetchPriceHistory: async (symbol: string) => {
    set({ isLoading: true });

    // Get ticker
    const { data: ticker } = await supabase
      .from('market_tickers')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (ticker) {
      set({
        selectedTicker: {
          id: ticker.id,
          symbol: ticker.symbol,
          name: ticker.name,
          price: Number(ticker.price),
          change: Number(ticker.change),
          changePercent: Number(ticker.change_percent),
          sector: ticker.sector,
          market: ticker.market,
          volume: ticker.volume,
        },
      });

      // Get price history
      const { data: history } = await supabase
        .from('price_history')
        .select('*')
        .eq('ticker_id', ticker.id)
        .order('date', { ascending: true })
        .limit(30);

      if (history) {
        set({
          priceHistory: history.map((h) => ({
            date: h.date,
            open: Number(h.open),
            high: Number(h.high),
            low: Number(h.low),
            close: Number(h.close),
            volume: h.volume,
          })),
        });
      }
    }

    set({ isLoading: false });
  },

  addTicker: async (ticker) => {
    const { error } = await supabase.from('market_tickers').insert({
      symbol: ticker.symbol,
      name: ticker.name,
      price: ticker.price,
      change: ticker.change,
      change_percent: ticker.changePercent,
      sector: ticker.sector,
      market: ticker.market,
      volume: ticker.volume,
    });

    if (!error) {
      await get().fetchTickers();
    }
  },

  removeTicker: async (id: string) => {
    const { error } = await supabase.from('market_tickers').delete().eq('id', id);

    if (!error) {
      set((state) => ({
        tickers: state.tickers.filter((t) => t.id !== id),
      }));
    }
  },
}));
```

---

### 9. Real-Time Updates (Optional)

Enable real-time subscriptions for live data:

```typescript
// In your component or store
useEffect(() => {
  const channel = supabase
    .channel('market_updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'market_tickers' },
      (payload) => {
        console.log('Market update:', payload);
        // Refresh your data
        fetchTickers();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

### 10. File Upload for Documents

```typescript
// Upload document to Supabase Storage
async function uploadDocument(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `documents/${fileName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: urlData.publicUrl,
  };
}
```

---

### 11. Testing Your Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test login with your admin user**

3. **Check browser console** for any Supabase errors

4. **Verify data loads** from Supabase tables

---

### 12. Environment-Specific Configs

**Development (.env.development):**
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-key
```

**Production (.env.production):**
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-key
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit .env files** - Already gitignored
2. ✅ **Use Row Level Security (RLS)** - Already configured
3. ✅ **Validate all inputs** on frontend and backend
4. ✅ **Use anon key** for client-side, service key only for server
5. ✅ **Enable email verification** in Supabase Auth settings
6. ✅ **Set up MFA** for admin users (optional)

---

## 🚨 Troubleshooting

### Error: "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Restart dev server after creating `.env`

### Error: "Invalid API key"
- Verify you copied the **anon** key, not service_role key
- Check for extra spaces in `.env` file

### Error: "Row Level Security policy violation"
- Ensure user is authenticated
- Check user role matches policy requirements
- Verify policies were created in SQL setup

### Data not loading
- Check browser console for errors
- Verify Supabase tables have data
- Test connection in Supabase dashboard

---

## 📚 Next Steps

1. **Update all stores** to use Supabase (portfolio, documents, payments, learning)
2. **Implement file uploads** for documents
3. **Add real-time subscriptions** for live updates
4. **Set up email templates** in Supabase Auth
5. **Configure custom domain** for production
6. **Set up backups** in Supabase dashboard
7. **Monitor usage** in Supabase dashboard

---

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Need help?** Check the Supabase docs or reach out to support!
