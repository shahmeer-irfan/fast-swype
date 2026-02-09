-- ============================================================
-- REMOVE PROPOSAL LIMIT FOR ALL USERS (existing + new)
-- Run in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- 1. Make can_send_proposal always return TRUE (no limit check)
CREATE OR REPLACE FUNCTION public.can_send_proposal(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix the trigger so NEW users get unlimited proposals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_limits (
    user_id,
    proposals_sent,
    proposals_limit,
    has_paid,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    999999,
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating user_limits: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Change the default on the column itself
ALTER TABLE public.user_limits 
ALTER COLUMN proposals_limit SET DEFAULT 999999;

ALTER TABLE public.user_limits 
ALTER COLUMN has_paid SET DEFAULT TRUE;

-- 4. Fix ALL existing users (including the ones stuck at 3)
UPDATE public.user_limits 
SET proposals_limit = 999999, has_paid = TRUE;

-- 5. Remove the can_send_proposal check from the RLS policy
DROP POLICY IF EXISTS "Users can create proposals" ON public.proposals;
CREATE POLICY "Users can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 6. Verify
SELECT 
  '✅ Proposal limits removed!' AS status,
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE proposals_limit >= 999999) AS unlimited_users,
  COUNT(*) FILTER (WHERE proposals_limit < 999999) AS still_limited
FROM public.user_limits;
