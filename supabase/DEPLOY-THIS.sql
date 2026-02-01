-- ============================================================
-- URGENT: DEPLOY THIS TO FIX PROFILE CREATION
-- ============================================================
-- Copy this entire file and paste in Supabase Dashboard > SQL Editor > New Query > Run
-- This will create the trigger that automatically creates profiles when users verify email

-- Step 1: Create the function
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Only proceed if email is being confirmed (was null, now has value)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      RAISE NOTICE 'Profile already exists for user %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Get name from metadata, ensure it's not an email
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
    IF user_name LIKE '%@%' THEN
      user_name := 'New User';
    END IF;
    
    RAISE NOTICE 'Creating profile for user % with metadata: name=%, campus=%, batch=%, dept=%', 
      NEW.id, 
      user_name, 
      COALESCE(NEW.raw_user_meta_data->>'campus', 'Islamabad'),
      COALESCE(NEW.raw_user_meta_data->>'batch', '2024'),
      COALESCE(NEW.raw_user_meta_data->>'department', 'CS');
    
    -- Create profile from user metadata
    INSERT INTO public.profiles (
      id, 
      email, 
      name, 
      department, 
      batch, 
      campus
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      COALESCE(NEW.raw_user_meta_data->>'department', 'CS'),
      COALESCE(NEW.raw_user_meta_data->>'batch', '2024'),
      COALESCE(NEW.raw_user_meta_data->>'campus', 'Islamabad')
    );
    
    RAISE NOTICE 'Profile created successfully for user %', NEW.id;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Step 4: Verify it's created
SELECT 
  'Trigger created successfully! ✅' AS status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_email_confirmed';

-- Step 5: Test with existing unconfirmed users (if any)
-- This will show you metadata for users who haven't verified yet
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'name' as metadata_name,
  raw_user_meta_data->>'campus' as metadata_campus,
  raw_user_meta_data->>'batch' as metadata_batch,
  raw_user_meta_data->>'department' as metadata_dept
FROM auth.users
WHERE email_confirmed_at IS NULL
LIMIT 5;
