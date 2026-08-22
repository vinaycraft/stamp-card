-- Admin User Setup Script
-- Run this in Supabase SQL Editor to create an admin user

-- Step 1: Create the admin user in Supabase Auth
-- You can do this via the Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add user"
-- 3. Enter email: admin@cafe.com
-- 4. Enter password: admin123 (or your preferred password)
-- 5. Click "Create user"

-- Step 2: After creating the user, get their UUID from the dashboard
-- Then run this SQL to set their role to admin:

-- REPLACE 'YOUR_ADMIN_UUID_HERE' with the actual UUID from step 1
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE id = '1720f74f-4459-476e-8512-f6d630823b4c';

-- If the user profile doesn't exist yet, create it:
INSERT INTO public.user_profiles (id, email, name, unique_code, role)
VALUES (
  'YOUR_ADMIN_UUID_HERE',
  'admin@cafe.com',
  'Cafe Admin',
  'ADMIN-' || substr(md5(random()::text), 1, 8),
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  name = 'Cafe Admin';

-- Verify the admin user was created correctly:
SELECT id, email, name, unique_code, role 
FROM public.user_profiles 
WHERE role = 'admin';
