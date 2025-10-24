-- Add clues column to questions table
-- Allows storing multiple clues as a JSON array

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS clues JSONB DEFAULT '[]'::jsonb;

-- Create index for faster clue queries
CREATE INDEX IF NOT EXISTS idx_questions_clues ON public.questions USING GIN (clues);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Clues column added to questions table successfully!';
END $$;
