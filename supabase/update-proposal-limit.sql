-- ============================================================
-- UPDATE PROPOSAL LIMIT FROM 2 TO 3
-- ============================================================
-- Run this in Supabase SQL Editor to update the proposal limit

-- Step 1: Update existing user_limits records to new limit
UPDATE public.user_limits 
SET proposals_limit = 3 
WHERE proposals_limit = 2;

-- Step 2: Update the default value in the table
ALTER TABLE public.user_limits 
ALTER COLUMN proposals_limit SET DEFAULT 3;

-- Step 3: Update the can_send_proposal function
CREATE OR REPLACE FUNCTION public.can_send_proposal(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  proposal_count INT;
  has_paid BOOLEAN;
BEGIN
  -- Get user's payment status
  SELECT COALESCE(ul.has_paid, FALSE) INTO has_paid
  FROM public.user_limits ul
  WHERE ul.user_id = user_uuid;
  
  -- If paid, allow unlimited
  IF has_paid THEN
    RETURN TRUE;
  END IF;
  
  -- Count proposals
  SELECT COUNT(*) INTO proposal_count
  FROM public.proposals
  WHERE from_user_id = user_uuid;
  
  RETURN proposal_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Verify changes
SELECT 
  'Proposal limit updated to 3! ✅' AS status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE proposals_limit = 3) as users_with_limit_3,
  COUNT(*) FILTER (WHERE proposals_limit = 2) as users_with_limit_2
FROM public.user_limits;

-- Step 5: Show table structure to confirm
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'user_limits' 
  AND column_name IN ('proposals_limit', 'proposals_sent');
