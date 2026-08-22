-- Add biometric credential support to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS biometric_credential_id TEXT UNIQUE;
