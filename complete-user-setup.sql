-- Complete User Setup for Castwell Portal
-- This will clean up and create a fresh admin user
-- Run this entire script in Supabase SQL Editor

-- Step 1: Delete existing test users (if any)
DELETE FROM public.profiles WHERE email IN ('admin@castwell.com', 'user@castwell.com');
DELETE FROM auth.users WHERE email IN ('admin@castwell.com', 'user@castwell.com');

-- Step 2: Create Admin User
DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@castwell.com',
    crypt('rainmaker_2026', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    false,
    '',
    '',
    '',
    ''
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, name, role, is_active, last_login)
  VALUES (
    admin_user_id,
    'admin@castwell.com',
    'Administrator',
    'admin',
    true,
    NOW()
  );

  RAISE NOTICE 'Admin user created: admin@castwell.com with password: rainmaker_2026';
END $$;

-- Step 3: Verify the user was created
SELECT
  u.id,
  u.email,
  u.created_at,
  u.confirmed_at,
  p.name,
  p.role,
  p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@castwell.com';

-- Step 4: Grant necessary permissions (if not already done)
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Success message
SELECT 'Setup complete! Login with: admin@castwell.com / rainmaker_2026' AS message;
