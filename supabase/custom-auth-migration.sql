-- Castwell Portal - Custom Authentication Migration
-- Run this in Supabase SQL Editor BEFORE deploying frontend changes
-- This replaces Supabase Auth with custom password authentication

-- ============================================
-- 1. ENABLE PGCRYPTO EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 2. ADD PASSWORD_HASH COLUMN TO PROFILES
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ============================================
-- 3. FIX ROLE CHECK CONSTRAINT (allow super_admin)
-- ============================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'user'));

-- ============================================
-- 4. DROP FOREIGN KEY TO auth.users
-- ============================================
-- Drop the FK from profiles.id -> auth.users(id)
-- We need to drop and recreate the primary key without the FK reference
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Re-add FKs from other tables to reference profiles(id) instead of auth.users(id)
ALTER TABLE portfolio_assets DROP CONSTRAINT IF EXISTS portfolio_assets_user_id_fkey;
ALTER TABLE portfolio_assets
  ADD CONSTRAINT portfolio_assets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE portfolio_performance DROP CONSTRAINT IF EXISTS portfolio_performance_user_id_fkey;
ALTER TABLE portfolio_performance
  ADD CONSTRAINT portfolio_performance_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE payments
  ADD CONSTRAINT payments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================
-- 5. DROP OLD AUTH TRIGGER & FUNCTIONS
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_email_by_username(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.admin_reset_password(UUID, TEXT) CASCADE;

-- ============================================
-- 6. DROP ALL RLS POLICIES & DISABLE RLS
-- ============================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- portfolio_assets
DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolio_assets;
DROP POLICY IF EXISTS "Admins can manage all portfolios" ON portfolio_assets;
DROP POLICY IF EXISTS "Admins can view all portfolios" ON portfolio_assets;
ALTER TABLE portfolio_assets DISABLE ROW LEVEL SECURITY;

-- portfolio_performance
DROP POLICY IF EXISTS "Users can view own performance" ON portfolio_performance;
DROP POLICY IF EXISTS "Admins can manage all performance" ON portfolio_performance;
ALTER TABLE portfolio_performance DISABLE ROW LEVEL SECURITY;

-- documents
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
DROP POLICY IF EXISTS "Users can view assigned documents" ON documents;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- articles
DROP POLICY IF EXISTS "Anyone can read articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can read articles" ON articles;
DROP POLICY IF EXISTS "Public can read articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- article_categories
DROP POLICY IF EXISTS "Anyone can read categories" ON article_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;
ALTER TABLE article_categories DISABLE ROW LEVEL SECURITY;

-- payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE CUSTOM AUTH RPC FUNCTIONS
-- ============================================

-- authenticate_user: validates credentials and returns user profile
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT id, username, email, name, role, is_active, created_at, last_login, password_hash
  INTO v_user
  FROM profiles
  WHERE username = p_username;

  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid username or password');
  END IF;

  IF NOT v_user.is_active THEN
    RETURN json_build_object('success', false, 'error', 'Account is disabled');
  END IF;

  IF v_user.password_hash IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No password set for this account. Contact an administrator.');
  END IF;

  IF v_user.password_hash = crypt(p_password, v_user.password_hash) THEN
    UPDATE profiles SET last_login = now() WHERE id = v_user.id;

    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'username', v_user.username,
        'email', v_user.email,
        'name', v_user.name,
        'role', v_user.role,
        'is_active', v_user.is_active,
        'created_at', v_user.created_at,
        'last_login', now()
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid username or password');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- create_user_with_password: creates a new user with hashed password
CREATE OR REPLACE FUNCTION public.create_user_with_password(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'user'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_hash TEXT;
BEGIN
  IF length(p_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE username = p_username) THEN
    RETURN json_build_object('success', false, 'error', 'Username already exists');
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RETURN json_build_object('success', false, 'error', 'Email already exists');
  END IF;

  v_user_id := gen_random_uuid();
  v_hash := crypt(p_password, gen_salt('bf', 10));

  INSERT INTO profiles (id, username, email, name, role, password_hash, is_active, created_at)
  VALUES (v_user_id, p_username, p_email, p_name, p_role, v_hash, true, now());

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user_id,
      'username', p_username,
      'email', p_email,
      'name', p_name,
      'role', p_role,
      'is_active', true,
      'created_at', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- change_password: updates a user's password
CREATE OR REPLACE FUNCTION public.change_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF length(p_new_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  v_hash := crypt(p_new_password, gen_salt('bf', 10));
  UPDATE profiles SET password_hash = v_hash WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. GRANT EXECUTE PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_with_password(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.change_password(UUID, TEXT) TO anon, authenticated;

-- ============================================
-- 9. GRANT TABLE ACCESS TO ANON ROLE
-- (Since RLS is disabled, anon needs direct table access)
-- ============================================
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON portfolio_assets TO anon, authenticated;
GRANT ALL ON portfolio_performance TO anon, authenticated;
GRANT ALL ON documents TO anon, authenticated;
GRANT ALL ON articles TO anon, authenticated;
GRANT ALL ON article_categories TO anon, authenticated;
GRANT ALL ON payments TO anon, authenticated;
GRANT ALL ON audit_logs TO anon, authenticated;

-- ============================================
-- 10. SEED ADMIN USER
-- Login with: admin / admin123
-- CHANGE THIS PASSWORD AFTER FIRST LOGIN!
-- ============================================
DELETE FROM profiles WHERE username = 'admin';
INSERT INTO profiles (id, username, email, name, role, password_hash, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@castwell.com',
  'System Administrator',
  'admin',
  crypt('admin123', gen_salt('bf', 10)),
  true,
  now()
);

-- Set a temporary password for any existing users without one
UPDATE profiles SET password_hash = crypt('changeme', gen_salt('bf', 10))
WHERE password_hash IS NULL AND username != 'admin';
