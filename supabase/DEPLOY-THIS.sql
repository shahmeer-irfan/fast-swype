-- ============================================================
-- CLEAN SLATE: DELETE ALL USER CREATION TRIGGERS & RECREATE
-- ============================================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- This will remove ALL existing triggers and create fresh ones

-- ============================================================
-- STEP 1: DROP ALL EXISTING TRIGGERS
-- ============================================================

-- Drop trigger on auth.users (email confirmation)
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_email_confirmation_trigger ON auth.users;

-- Drop trigger on public.profiles (profile creation)
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON public.profiles;

-- Drop any other profile-related triggers
DROP TRIGGER IF EXISTS on_new_profile ON public.profiles;

-- ============================================================
-- STEP 2: DROP OLD FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_user(uuid) CASCADE;

-- ============================================================
-- STEP 3: CREATE NEW FUNCTION FOR EMAIL CONFIRMATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_campus TEXT;
  user_batch TEXT;
  user_dept TEXT;
BEGIN
  -- Only proceed if email is being confirmed (changed from NULL to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    RAISE NOTICE '🔔 Email confirmed for user: %', NEW.email;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      RAISE NOTICE '✅ Profile already exists for user %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Extract metadata
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
    user_campus := COALESCE(NEW.raw_user_meta_data->>'campus', 'Islamabad');
    user_batch := COALESCE(NEW.raw_user_meta_data->>'batch', '2024');
    user_dept := COALESCE(NEW.raw_user_meta_data->>'department', 'CS');
    
    -- Ensure name is not an email
    IF user_name LIKE '%@%' THEN
      user_name := 'New User';
    END IF;
    
    RAISE NOTICE '📝 Creating profile with: name=%, campus=%, batch=%, dept=%', 
      user_name, user_campus, user_batch, user_dept;
    
    -- Create the profile
    INSERT INTO public.profiles (
      id, 
      email, 
      name, 
      department, 
      batch, 
      campus,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      user_dept,
      user_batch,
      user_campus,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Profile created successfully for user %', NEW.email;
    
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error creating profile for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 4: CREATE NEW FUNCTION FOR USER LIMITS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE '📊 Creating user_limits for profile: %', NEW.id;
  
  -- Create user limits entry
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
  
  RAISE NOTICE '✅ User limits created for: %', NEW.id;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error creating user_limits: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 5: CREATE TRIGGERS
-- ============================================================

-- Trigger 1: Create profile when user confirms email
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Trigger 2: Create user_limits when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 6: VERIFY TRIGGERS ARE CREATED
-- ============================================================

SELECT 
  '✅ ALL TRIGGERS CREATED SUCCESSFULLY!' AS status;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_email_confirmed', 'on_profile_created')
ORDER BY event_object_table, trigger_name;

-- ============================================================
-- STEP 7: DEBUG - CHECK EXISTING USERS
-- ============================================================

-- Check auth users and their metadata
SELECT 
  'Confirmed users without profiles:' AS debug_info,
  COUNT(*) AS count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email_confirmed_at IS NOT NULL 
  AND p.id IS NULL;

-- Show details of users without profiles
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'name' as metadata_name,
  au.raw_user_meta_data->>'campus' as metadata_campus,
  au.raw_user_meta_data->>'batch' as metadata_batch,
  au.raw_user_meta_data->>'department' as metadata_dept,
  CASE WHEN p.id IS NULL THEN '❌ NO PROFILE' ELSE '✅ HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ============================================================
-- DONE! Now test by having a user:
-- 1. Sign up with new email
-- 2. Verify email via link
-- 3. Log in
-- 4. Profile should exist automatically
-- ============================================================
