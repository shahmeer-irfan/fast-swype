# 🔧 Complete Setup & Fix Instructions

## 🚨 CRITICAL FIXES TO APPLY NOW

### Issue 1: Missing Profiles for Authenticated Users
**Problem**: You have 4 authenticated users but only 2 profiles in the database.

**Solution**: Run this SQL in Supabase SQL Editor:

```sql
-- Fix Missing Profiles Migration
-- This creates profiles for any auth users that don't have a profile entry

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
```

✅ **Expected Result**: All 4 users should now have profiles.

---

### Issue 2: Profile Pictures Not Displaying

**Diagnosis Checklist**:

1. **Check if profile_picture_url column exists**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'profile_picture_url';
```

If returns nothing, run:
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

2. **Check if profile pictures are actually uploaded**:
```sql
SELECT id, name, profile_picture_url 
FROM profiles 
WHERE profile_picture_url IS NOT NULL;
```

3. **Check if storage bucket exists**:
- Go to Supabase Dashboard → Storage
- Verify `profile-pictures` bucket exists
- Verify it's marked as **PUBLIC**

4. **Check if storage policies exist**:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

If no policies exist for profile-pictures, run these:

```sql
-- Upload Policy
CREATE POLICY "Users can upload their profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Update Policy
CREATE POLICY "Users can update their profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Delete Policy
CREATE POLICY "Users can delete their profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Select Policy (PUBLIC - anyone can view)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');
```

5. **Test upload manually**:
- Login to your app
- Go to Profile → Edit
- Upload a profile picture
- Check if it appears in Storage → profile-pictures bucket
- The file path should be: `userId/timestamp.ext`

6. **Check browser console for errors**:
- Open DevTools (F12)
- Look for 404 errors or CORS errors when loading images

---

### Issue 3: Swipe Logic Fixed

**Old Behavior**: Cards swiped left were excluded forever.

**New Behavior**: 
- ✅ Cards can reappear after being passed (swiped left)
- ✅ Only cards where you sent proposals are excluded forever

**What Changed**:
The `getUnswipedProfiles` function now only excludes profiles where you've sent proposals, not all swipes.

**To Test**:
1. Go to /swipe page
2. Swipe left on a card (pass)
3. Refresh the page
4. The card should reappear (can swipe again)
5. Send proposal to a card
6. That card should NOT reappear anymore

---

## 🧪 Complete Testing Checklist

### Test 1: Profile Creation & Display
- [ ] All 4 authenticated users have profiles in database
- [ ] Can view any user's profile
- [ ] Profile picture displays correctly (if uploaded)

### Test 2: Profile Picture Upload
- [ ] Can upload profile picture on edit page
- [ ] Preview shows immediately
- [ ] Picture appears in Storage bucket
- [ ] Picture displays on profile page (80x80)
- [ ] Picture displays on swipe cards (120x120)
- [ ] Can remove profile picture

### Test 3: Swipe Logic
- [ ] See all available profiles (not yourself)
- [ ] Can swipe left (pass)
- [ ] Can swipe right (flip to proposal form)
- [ ] Passed cards reappear on refresh
- [ ] Cards with sent proposals don't reappear

### Test 4: Proposal Flow
- [ ] Can send first proposal (free)
- [ ] Can send second proposal (free)
- [ ] Third proposal shows payment modal
- [ ] After payment, unlimited proposals work

---

## 🔍 Debugging Commands

### Check Database State:

```sql
-- Count users vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM proposals) as proposals,
  (SELECT COUNT(*) FROM swipes) as swipes;

-- See all profiles with pictures
SELECT id, name, email, profile_picture_url 
FROM profiles 
ORDER BY created_at DESC;

-- See all proposals
SELECT 
  p.id,
  sender.name as sender,
  receiver.name as receiver,
  p.message,
  p.status,
  p.created_at
FROM proposals p
JOIN profiles sender ON p.from_user_id = sender.id
JOIN profiles receiver ON p.to_user_id = receiver.id
ORDER BY p.created_at DESC;

-- See all swipes
SELECT 
  swiper.name as swiper,
  swiped.name as swiped,
  s.direction,
  s.created_at
FROM swipes s
JOIN profiles swiper ON s.user_id = swiper.id
JOIN profiles swiped ON s.swiped_user_id = swiped.id
ORDER BY s.created_at DESC;

-- Check storage objects
SELECT 
  name,
  bucket_id,
  created_at
FROM storage.objects
ORDER BY created_at DESC;
```

---

## 🚀 Quick Fix Summary

Run these in order:

1. **Fix missing profiles**:
```sql
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
```

2. **Add profile_picture_url column** (if missing):
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

3. **Create profile-pictures bucket**:
- Dashboard → Storage → New Bucket
- Name: `profile-pictures`
- Make it PUBLIC ✓

4. **Add storage policies** (copy from SUPABASE_SETUP.md Step 6)

5. **Deploy code changes**:
```bash
npm run build
git add .
git commit -m "fix: swipe logic and profile picture display"
git push origin main
```

6. **Test everything**:
- Sign in with each user
- Check if profiles load
- Upload profile pictures
- Test swipe functionality
- Send proposals

---

## ✅ Success Indicators

You'll know everything works when:

1. ✅ All 4 users appear in profiles table
2. ✅ Profile pictures upload successfully
3. ✅ Pictures display on profile page and swipe cards
4. ✅ Cards reappear after passing (swiping left)
5. ✅ Cards with proposals don't reappear
6. ✅ No errors in browser console
7. ✅ No RLS policy errors in Supabase logs

---

## 🆘 Need Help?

1. Check Supabase Dashboard → Logs for errors
2. Check browser console (F12) for frontend errors
3. Verify environment variables are correct
4. Make sure storage bucket is PUBLIC
5. Verify RLS policies are applied correctly

---

**Last Updated**: January 2026
**Code Version**: Latest with swipe logic fix
