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

-- Allow everyone to read the leaderboard (public)
CREATE POLICY "Anyone can view treasure unlocks"
  ON public.treasure_unlocks
  FOR SELECT
  USING (true);

-- Allow anyone to insert their unlock (we'll add rate limiting in edge function)
CREATE POLICY "Anyone can add unlock"
  ON public.treasure_unlocks
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster leaderboard queries
CREATE INDEX idx_treasure_unlocks_timestamp ON public.treasure_unlocks(timestamp ASC);
CREATE INDEX idx_treasure_unlocks_level ON public.treasure_unlocks(level);

-- Enable realtime for live leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.treasure_unlocks;