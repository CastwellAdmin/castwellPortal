# Castwell Portal - Final Setup Instructions

## 📋 Quick Setup Checklist

### 1. Add Logo Files

Save your logo images to the `public/images/` directory:

- **Logo (light background)**: Save as `public/images/logo-light.png`
- **Logo (dark background)**: Save as `public/images/logo-dark.png`
- **Favicon**: Save as `public/favicon.png`

### 2. Run SQL in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/wlsjbouwykyoyxzljkvl
2. Click **SQL Editor** → **New query**
3. Copy the entire SQL from `supabase-setup.sql`
4. Click **Run**

### 3. Create Storage Bucket

1. In Supabase, go to **Storage** → **New bucket**
2. Name: `documents`
3. Make it **Private**
4. Go back to SQL Editor and run:

```sql
-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to view assigned documents
CREATE POLICY "Users can view assigned documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow admins to manage all documents
CREATE POLICY "Admins can manage documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 4. Create Your Admin User

1. In Supabase: **Authentication** → **Users** → **Add user**
2. Email: `damanuwant@proton.me`
3. Password: (your choice)
4. After creating, run in SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'damanuwant@proton.me';
```

### 5. Run the App

```bash
npm run dev
```

Open http://localhost:5173/ and log in!

## ✅ What's Integrated

- ✅ **Authentication**: Real Supabase auth
- ✅ **Portfolio**: Real data from Supabase
- ✅ **Documents**: Real storage with Supabase
- ✅ **Articles**: Real data from Supabase
- ✅ **Market Data**: Live from Finnhub API
- ✅ **Brand Colors**: Castwell Gold (#D4AF37) and Gray (#6B7280)
- ✅ **Logo**: Ready to display (once you add image files)

## 🔑 API Keys Configured

- **Supabase**: ✅ Configured
- **Finnhub**: ✅ Configured (d5fgfj9r01qnjhoc5a6g)

## 🎨 Castwell Brand Colors

```css
Primary Gold: #D4AF37
Secondary Gray: #6B7280
```

## 📱 Your App URLs

- **Local**: http://localhost:5173/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wlsjbouwykyoyxzljkvl

---

**You're all set!** Just add the logo files and run the SQL in Supabase, then you're ready to go! 🚀
