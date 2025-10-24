-- ============================================
-- Fix RLS policies to allow admin CRUD operations
-- The previous policies were too restrictive
-- ============================================

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Questions are read-only publicly" ON public.questions;
DROP POLICY IF EXISTS "Questions are read-only publicly (update)" ON public.questions;
DROP POLICY IF EXISTS "Questions are read-only publicly (delete)" ON public.questions;

DROP POLICY IF EXISTS "Admin config cannot be modified from client" ON public.admin_config;
DROP POLICY IF EXISTS "Admin config cannot be updated from client" ON public.admin_config;
DROP POLICY IF EXISTS "Admin config cannot be deleted from client" ON public.admin_config;

-- Create new policies that allow all operations (controlled by app password logic)
CREATE POLICY "Allow all INSERT on questions"
  ON public.questions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on questions"
  ON public.questions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on questions"
  ON public.questions
  FOR DELETE
  USING (true);

CREATE POLICY "Allow all INSERT on admin_config"
  ON public.admin_config
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on admin_config"
  ON public.admin_config
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on admin_config"
  ON public.admin_config
  FOR DELETE
  USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated to allow CRUD operations!';
END $$;
