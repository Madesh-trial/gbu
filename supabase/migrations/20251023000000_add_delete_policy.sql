-- Add delete policy to allow anyone to delete leaderboard entries
CREATE POLICY "Anyone can delete treasure unlocks"
  ON public.treasure_unlocks
  FOR DELETE
  USING (true);
