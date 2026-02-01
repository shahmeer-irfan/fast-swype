-- ==================================================
-- FIX: Profile Creation on Email Confirmation
-- ==================================================
-- Run this in Supabase SQL Editor to fix profile creation issue

-- 1. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

-- 2. Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_campus TEXT;
  user_batch TEXT;
  user_dept TEXT;
BEGIN
  -- Only proceed if email is being confirmed (was null, now has value)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      RAISE NOTICE 'Profile already exists for user %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Extract metadata with proper error handling
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
    user_campus := COALESCE(NEW.raw_user_meta_data->>'campus', 'Islamabad');
    user_batch := COALESCE(NEW.raw_user_meta_data->>'batch', '2024');
    user_dept := COALESCE(NEW.raw_user_meta_data->>'department', 'CS');
    
    -- Ensure name is never an email
    IF user_name LIKE '%@%' THEN
      user_name := 'New User';
    END IF;
    
    RAISE NOTICE 'Creating profile for user % with name: %, campus: %, batch: %, dept: %', 
      NEW.id, user_name, user_campus, user_batch, user_dept;
    
    -- Create the profile
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
      user_dept,
      user_batch,
      user_campus
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

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- 4. Test query to check if trigger is working
-- After running this, try signing up a new user and check if profile is created
SELECT 
  'Trigger installed successfully! Now test by creating a new user.' AS status;
