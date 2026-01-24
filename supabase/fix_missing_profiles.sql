-- Fix Missing Profiles Migration
-- This creates profiles for any auth users that don't have a profile entry

-- Insert missing profiles from auth.users
INSERT INTO public.profiles (id, email, name, department, batch, campus)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)) as name,
  COALESCE(au.raw_user_meta_data->>'department', 'CS') as department,
  COALESCE(au.raw_user_meta_data->>'batch', '2023') as batch,
  COALESCE(au.raw_user_meta_data->>'campus', 'Islamabad') as campus
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verify the fix
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM public.profiles) as missing_profiles
FROM auth.users;
