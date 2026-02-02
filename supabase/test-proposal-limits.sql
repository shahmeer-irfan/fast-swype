-- ============================================================
-- TEST PROPOSAL LIMIT ENFORCEMENT
-- ============================================================

-- Step 1: Check if function exists and works
SELECT can_send_proposal('YOUR_USER_ID_HERE');

-- Step 2: Check user limits table
SELECT 
  user_id,
  proposals_sent,
  proposals_limit,
  has_paid,
  CASE 
    WHEN has_paid THEN 'Unlimited (Paid)'
    WHEN proposals_sent >= proposals_limit THEN 'Limit Reached'
    ELSE 'Can Send (' || (proposals_limit - proposals_sent) || ' left)'
  END as status
FROM public.user_limits;

-- Step 3: Check actual proposal counts vs user_limits
SELECT 
  ul.user_id,
  ul.proposals_sent as limits_table_count,
  COUNT(p.id) as actual_proposal_count,
  ul.proposals_limit,
  ul.has_paid,
  CASE 
    WHEN ul.has_paid THEN TRUE
    WHEN COUNT(p.id) < ul.proposals_limit THEN TRUE
    ELSE FALSE
  END as should_allow
FROM public.user_limits ul
LEFT JOIN public.proposals p ON p.from_user_id = ul.user_id
GROUP BY ul.user_id, ul.proposals_sent, ul.proposals_limit, ul.has_paid;

-- Step 4: If counts are mismatched, update them
UPDATE public.user_limits ul
SET proposals_sent = (
  SELECT COUNT(*)
  FROM public.proposals p
  WHERE p.from_user_id = ul.user_id
)
WHERE proposals_sent != (
  SELECT COUNT(*)
  FROM public.proposals p
  WHERE p.from_user_id = ul.user_id
);

-- Step 5: Verify the fix
SELECT 
  'Updated proposal counts!' as message,
  COUNT(*) as users_updated
FROM public.user_limits ul
WHERE proposals_sent = (
  SELECT COUNT(*)
  FROM public.proposals p
  WHERE p.from_user_id = ul.user_id
);
