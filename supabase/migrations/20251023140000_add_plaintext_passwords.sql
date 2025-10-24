-- ============================================
-- Update admin_config to use plaintext passwords
-- Simpler approach for app-controlled passwords
-- ============================================

-- Add plaintext password columns if they don't exist
ALTER TABLE public.admin_config
ADD COLUMN IF NOT EXISTS admin_password TEXT DEFAULT 'admin123',
ADD COLUMN IF NOT EXISTS hint_password TEXT DEFAULT 'hint123';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Admin config table updated with plaintext password columns!';
END $$;
