# Castwell Client Dashboard Portal

A modern, high-performance investment and client management dashboard built with Vite, React, TypeScript, and Supabase.

## 🌟 Features

### Client Dashboard
- **Portfolio Management**: Track assets, view allocations, and monitor performance
- **Market Data**: Live ticker watchlist, detailed charts, and sector analysis
- **Documents**: View, download, and digitally sign important documents
- **Payments**: Complete transaction history and statements
- **Learning Center**: Market education with categorized articles about market fundamentals, sectors, and analysis
- **Profile Management**: Update personal information and preferences

### Admin Dashboard
- **Platform Overview**: Key metrics, user activity, and system health
- **User Management**: Complete CRUD operations for user accounts (including password resets)
- **Market Management**: Add and manage stock tickers
- **Document Management**: Upload documents and assign to users
- **Platform Settings**: Configure system settings
- **Audit Logs**: Track all administrative actions

## 🛠️ Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts
- **Icons**: React Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

## 🚀 Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at https://supabase.com
2. Run the SQL schema from `supabase-setup.sql` in your Supabase SQL Editor
3. Create a storage bucket named `documents` (private)
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Admin User

In Supabase dashboard > Authentication > Users:
1. Add a new user
2. Go to SQL Editor and run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── charts/        # Chart components (Line, Pie, Bar)
│   ├── forms/         # Form inputs and buttons
│   ├── layout/        # Layout wrappers (User/Admin)
│   ├── modals/        # Modal dialogs
│   └── tables/        # Data tables
├── pages/             # Route pages
│   ├── auth/          # Login, forgot password, etc.
│   ├── user/          # Client dashboard pages
│   └── admin/         # Admin dashboard pages
├── store/             # Zustand state stores
├── types/             # TypeScript type definitions
├── lib/               # Utilities (Supabase client)
└── App.tsx            # Main app with routing
```

## 🔒 Security Features

- Row Level Security (RLS) policies in Supabase
- Role-based access control (User/Admin)
- Protected routes with authentication checks
- Secure document storage with signed URLs
- **Password management**: Only admins can reset user passwords
- **Learning Center**: Market-focused education (user-facing only)

## 📚 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔗 Integration Guide

See `SUPABASE_INTEGRATION_GUIDE.md` for detailed instructions on:
- Setting up Supabase database
- Configuring storage buckets
- Updating stores to use Supabase
- Implementing file uploads
- Adding real-time subscriptions

## 📊 Database Schema

Complete SQL schema available in `supabase-setup.sql`

Key tables:
- `profiles` - User accounts extending Supabase auth
- `market_tickers` - Stock ticker data
- `portfolio_assets` - User portfolio holdings
- `documents` - Document metadata
- `payments` - Transaction history
- `articles` - Learning center content (market-focused)

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Deploy Options

- **Vercel**: Connect GitHub repo for automatic deploys
- **Netlify**: Drag & drop `dist` folder
- **Cloudflare Pages**: Connect repo or upload build

**Environment Variables**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your deployment platform.

---

Built with ❤️ for Castwell
