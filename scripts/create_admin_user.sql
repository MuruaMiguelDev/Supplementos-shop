-- Create admin user
-- This script creates a user in Supabase Auth and sets them as admin

-- First, we need to insert into auth.users
-- Note: You'll need to replace 'admin@example.com' and 'admin123456' with your desired credentials

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert user into auth.users
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
    'admin@example.com', -- CHANGE THIS to your email
    crypt('admin123456', gen_salt('bf')), -- CHANGE THIS to your password
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
  RETURNING id INTO user_id;

  -- The trigger will automatically create the profile
  -- Now update the profile to set admin flag
  -- Changed from role = 'admin' to is_admin = true
  UPDATE public.profiles
  SET is_admin = true
  WHERE id = user_id;

  RAISE NOTICE 'Admin user created with ID: %', user_id;
END $$;
