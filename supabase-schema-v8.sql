-- Schema v8: Story Chapters for Fan Fiction Feature
-- Run this in Supabase SQL Editor

-- Story chapters table
CREATE TABLE IF NOT EXISTS public.story_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_number integer NOT NULL DEFAULT 1,
  content text NOT NULL,
  summary text NOT NULL, -- Running summary for continuation (~200 words)
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chapter_number)
);

-- Enable RLS
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;

-- Policies (open for demo, like other tables)
CREATE POLICY "Users can read own chapters" ON public.story_chapters
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own chapters" ON public.story_chapters
  FOR INSERT WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_story_chapters_user ON public.story_chapters(user_id, chapter_number DESC);
