-- Reset Admin Credentials for Castwell Portal
-- Run this in your Supabase SQL Editor

-- OPTION 1: Create a new admin user
-- Change the email and password below to what you want

DO $$
DECLARE
  new_user_id UUID;
  admin_email TEXT := 'admin@castwell.com'; -- CHANGE THIS
  admin_password TEXT := 'admin123';        -- CHANGE THIS
  admin_name TEXT := 'Administrator';
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (id, email, name, role, is_active)
  VALUES (new_user_id, admin_email, admin_name, 'admin', true);

  RAISE NOTICE 'Admin user created successfully with email: %', admin_email;
END $$;

-- OPTION 2: Update existing admin password
-- Uncomment and modify this if you want to reset an existing user's password

/*
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then update the password (replace the ID and password)
UPDATE auth.users
SET encrypted_password = crypt('new-password-here', gen_salt('bf'))
WHERE id = 'your-user-id-here';

-- Update their profile to admin if needed
UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE id = 'your-user-id-here';
*/

-- OPTION 3: List all users to find yours
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  p.name,
  p.role,
  p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
