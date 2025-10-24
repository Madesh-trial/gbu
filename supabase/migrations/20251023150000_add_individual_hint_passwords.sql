-- ============================================
-- Add individual hint passwords for each question
-- ============================================

-- Add hint_password column to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS hint_password TEXT DEFAULT 'hint123';

-- Set default hint passwords for existing questions
UPDATE public.questions 
SET hint_password = 'hint123' 
WHERE hint_password IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE public.questions 
ALTER COLUMN hint_password SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_questions_hint_password ON public.questions(id, hint_password);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Individual hint passwords added to questions table!';
END $$;
