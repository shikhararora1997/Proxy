-- ================================================
-- PROXY Schema v7 - 3-Day Reflection Feature
-- Run this in your Supabase SQL Editor
-- ================================================

-- Add last_review_at column to profiles for tracking 3-day reviews
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_review_at timestamptz DEFAULT NULL;

-- Note: last_review_at is updated after user completes a 3-day reflection
-- NULL means user has never done a reflection (new users)
