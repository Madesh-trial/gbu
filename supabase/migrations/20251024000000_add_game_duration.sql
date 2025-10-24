-- ============================================
-- Add game duration configuration
-- ============================================

-- Add game_duration column to admin_config table (in minutes)
ALTER TABLE public.admin_config 
ADD COLUMN IF NOT EXISTS game_duration_minutes INTEGER DEFAULT 30;

-- Update existing admin_config records
UPDATE public.admin_config 
SET game_duration_minutes = 30 
WHERE game_duration_minutes IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_config_duration ON public.admin_config(id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Game duration configuration added to admin_config table!';
END $$;
