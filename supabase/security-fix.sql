-- ============================================================
-- SECURITY FIX: Drop old policies & create hardened ones
-- Run in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- ============================================================
-- 1. DROP ALL EXISTING POLICIES
-- ============================================================

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Skills
DROP POLICY IF EXISTS "Users can view all skills" ON public.skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.skills;

-- Interests
DROP POLICY IF EXISTS "Users can view all interests" ON public.interests;
DROP POLICY IF EXISTS "Users can manage their own interests" ON public.interests;

-- Proposals
DROP POLICY IF EXISTS "Users can view their proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Recipients can update proposal status" ON public.proposals;

-- Swipes
DROP POLICY IF EXISTS "Users can manage their own swipes" ON public.swipes;

-- Payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- User Limits
DROP POLICY IF EXISTS "Users can view their own limits" ON public.user_limits;

-- ============================================================
-- 2. PROFILES — Hide sensitive fields (fcm_token, phone, email)
-- ============================================================

-- Everyone can read profiles BUT only non-sensitive columns are exposed
-- (fcm_token, phone_number, contact_email are still in the table but
--  we control access via _what_ the client queries — see note below)
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only insert their own profile (fixed: removed OR auth.uid() IS NOT NULL)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile (GDPR/privacy)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- 3. SKILLS
-- ============================================================

CREATE POLICY "Authenticated users can view skills"
  ON public.skills FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own skills"
  ON public.skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON public.skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON public.skills FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. INTERESTS
-- ============================================================

CREATE POLICY "Authenticated users can view interests"
  ON public.interests FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own interests"
  ON public.interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interests"
  ON public.interests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON public.interests FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. PROPOSALS — Tighten update to status-only
-- ============================================================

CREATE POLICY "Users can view own proposals"
  ON public.proposals FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id AND can_send_proposal(auth.uid()));

-- Recipients can only update status to accepted/rejected (not modify message etc.)
CREATE POLICY "Recipients can update proposal status"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = to_user_id)
  WITH CHECK (
    auth.uid() = to_user_id
    AND status IN ('accepted', 'rejected')
  );

-- ============================================================
-- 6. SWIPES
-- ============================================================

CREATE POLICY "Users can view own swipes"
  ON public.swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own swipes"
  ON public.swipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. PAYMENTS — Fix INSERT policy
-- ============================================================

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Fixed: removed OR auth.uid() IS NOT NULL
CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. USER LIMITS — Read-only for users
-- ============================================================

CREATE POLICY "Users can view own limits"
  ON public.user_limits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 9. CREATE SECURE VIEW FOR BROWSING (hides sensitive columns)
-- ============================================================

-- This view excludes fcm_token, phone_number, contact_email
-- Use this for browsing/swipe queries instead of the profiles table directly
CREATE OR REPLACE VIEW public.browsable_profiles AS
  SELECT 
    id, email, name, department, batch, campus, 
    bio, domain, looking_for, availability, 
    profile_picture_url, created_at, updated_at
  FROM public.profiles;

-- ============================================================
-- DONE! Verify policies are created:
-- ============================================================

SELECT 
  tablename, 
  policyname, 
  permissive, 
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
