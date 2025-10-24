-- ============================================
-- TREASURE QUEST DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Create leaderboard table for treasure hunt unlocks
CREATE TABLE IF NOT EXISTS public.treasure_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  user_id UUID,
  level INTEGER NOT NULL DEFAULT 5,
  attempts INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.treasure_unlocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view treasure unlocks" ON public.treasure_unlocks;
DROP POLICY IF EXISTS "Anyone can add unlock" ON public.treasure_unlocks;
DROP POLICY IF EXISTS "Anyone can delete treasure unlocks" ON public.treasure_unlocks;

-- Allow everyone to read the leaderboard (public)
CREATE POLICY "Anyone can view treasure unlocks"
  ON public.treasure_unlocks
  FOR SELECT
  USING (true);

-- Allow anyone to insert their unlock
CREATE POLICY "Anyone can add unlock"
  ON public.treasure_unlocks
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete treasure unlocks (for reset functionality)
CREATE POLICY "Anyone can delete treasure unlocks"
  ON public.treasure_unlocks
  FOR DELETE
  USING (true);

-- Create indexes for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_treasure_unlocks_timestamp ON public.treasure_unlocks(timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_treasure_unlocks_level ON public.treasure_unlocks(level);

-- Enable realtime for live leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.treasure_unlocks;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete! The treasure_unlocks table is ready.';
END $$;
