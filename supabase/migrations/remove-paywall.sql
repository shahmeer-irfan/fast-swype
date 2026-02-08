-- =====================================================
-- REMOVE PAYWALL - Allow unlimited proposals for everyone
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Update the can_send_proposal function to always return true
CREATE OR REPLACE FUNCTION public.can_send_proposal(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- No limits — everyone can send unlimited proposals
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the RLS policy on proposals to remove the can_send_proposal check
DROP POLICY IF EXISTS "Users can create proposals" ON public.proposals;
CREATE POLICY "Users can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 3. (Optional) Drop the payments table and user_limits table if you want to clean up
-- Uncomment these if you want to fully remove payment/limits tables:
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.user_limits CASCADE;

-- 4. Mark all existing users as having unlimited access (in case old code checks)
UPDATE public.user_limits SET has_paid = TRUE, proposals_limit = 999999;
