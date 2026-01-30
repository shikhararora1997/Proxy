-- ================================================
-- PROXY Schema v6 - Password Authentication
-- Run this in your Supabase SQL Editor
-- ================================================

-- Add password_hash column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_hash text;

-- Note: For existing users, password_hash will be NULL
-- They'll need to "sign up" again with a password
