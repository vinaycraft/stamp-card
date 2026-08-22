-- Admin User Setup Script
-- Run this in Supabase SQL Editor to create an admin user

-- Create admin user
INSERT INTO public.user_profiles (id, email, name, phone, unique_code, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@cafe.com',
  'Cafe Admin',
  'admin123',
  'ADMIN-' || substr(md5(random()::text), 1, 8),
  'admin',
  NOW()
);

-- Verify the admin user was created correctly:
SELECT id, email, name, unique_code, role
FROM public.user_profiles
WHERE role = 'admin';
