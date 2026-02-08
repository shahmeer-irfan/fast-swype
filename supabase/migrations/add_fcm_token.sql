-- =====================================================
-- Add FCM token support to profiles table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- Step 1: Add fcm_token column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS fcm_token TEXT DEFAULT NULL;

-- Step 2: Create index for faster FCM token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token 
ON profiles (fcm_token) 
WHERE fcm_token IS NOT NULL;

-- Step 3: RLS policy - allow users to update their own fcm_token
-- (Your existing RLS policies likely already cover this, but just in case)
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own fcm_token'
  ) THEN
    CREATE POLICY "Users can update own fcm_token" 
    ON profiles 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'fcm_token';
