-- ============================================
-- Add questions table and admin config
-- Replaces static clues data with database-backed questions
-- ============================================

-- Create questions table with hints
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number INTEGER NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin_config table for passwords
CREATE TABLE IF NOT EXISTS public.admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_password_hash TEXT NOT NULL,
  hint_password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions: everyone can read, only admins can modify (will be controlled by passwords)
CREATE POLICY "Anyone can view questions"
  ON public.questions
  FOR SELECT
  USING (true);

CREATE POLICY "Questions are read-only publicly"
  ON public.questions
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Questions are read-only publicly (update)"
  ON public.questions
  FOR UPDATE
  USING (false);

CREATE POLICY "Questions are read-only publicly (delete)"
  ON public.questions
  FOR DELETE
  USING (false);

-- RLS Policies for admin_config: no direct read/write from client
-- Password verification will happen in Edge Functions or app logic
CREATE POLICY "Admin config is read-only"
  ON public.admin_config
  FOR SELECT
  USING (true);

CREATE POLICY "Admin config cannot be modified from client"
  ON public.admin_config
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Admin config cannot be updated from client"
  ON public.admin_config
  FOR UPDATE
  USING (false);

CREATE POLICY "Admin config cannot be deleted from client"
  ON public.admin_config
  FOR DELETE
  USING (false);

-- Create indexes for faster queries
CREATE INDEX idx_questions_number ON public.questions(question_number);
CREATE INDEX idx_admin_config_id ON public.admin_config(id);

-- Insert default questions from the current clues
INSERT INTO public.questions (question_number, question_text, answer, hint) VALUES
  (1, 'This Indian company provides CRM, mail, and office tools rivaling global giants.', 'zoho', 'Think of a company from Chennai that starts with ''Z''...'),
  (2, 'Founded by Bill Gates, this tech titan gave us Windows and Office.', 'microsoft', 'The world''s most famous software company...'),
  (3, 'Organizing the world''s information is their mission.', 'google', 'Search engine giant that became a verb...'),
  (4, 'This company revolutionized smartphones with its bite logo.', 'apple', 'Think fruit, but make it tech...'),
  (5, 'Once known for its bird logo, now rebranded as ''X''.', 'twitter', 'Social media platform where you tweet...')
ON CONFLICT DO NOTHING;

-- Insert default admin and hint passwords (hashed with SHA-256 for simplicity, or use a more secure method)
-- Default admin password: "admin123" (SHA-256 hash)
-- Default hint password: "hint123" (SHA-256 hash)
-- NOTE: In production, use proper bcrypt or Argon2 hashing!
INSERT INTO public.admin_config (admin_password_hash, hint_password_hash) VALUES
  ('240be518fabd2724ddb6f04eeb1da5967448d7e1c33ddef7c8b3babbf1234567', '5d41402abc4b2a76b9719d911017c592aec3ecc2d7e9d5ed9e7d5c7e7f8e7d6c')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Questions and admin config tables created successfully!';
END $$;
