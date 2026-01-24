# 🚀 Supabase Setup Guide for SWYPE

## 📋 Complete Implementation Checklist

### Step 1: Get Supabase API Keys
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/upphblfmgwqzjzunlhli
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://upphblfmgwqzjzunlhli.supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (starts with `eyJ...`)

### Step 2: Update Environment Variables
1. Open `.env.local` file in my-app folder
2. Replace placeholders with your actual keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://upphblfmgwqzjzunlhli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here

# Payment Configuration
NEXT_PUBLIC_PAYMENT_AMOUNT=250
NEXT_PUBLIC_IBAN_NUMBER=PK00XXXX0000000000000000  # Your actual IBAN
NEXT_PUBLIC_PAYMENT_WHATSAPP=+923001234567  # Your WhatsApp number
```

### Step 3: Run Database Schema
1. Go to Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy **entire content** from `supabase/schema.sql`
4. Click **RUN** to create all tables, functions, and policies

### Step 4: Create Storage Bucket
1. Go to Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name: `payment-screenshots`
4. Make it **Private** (uncheck public)
5. Click **Create Bucket**

### Step 5: Set Storage Policies
Go to Storage → payment-screenshots → Policies → Add these:

**Upload Policy:**
```sql
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

**Select Policy:**
```sql
CREATE POLICY "Users can view their own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-screenshots'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

### Step 6: Verify Setup
Run this test query in SQL Editor:
```sql
SELECT * FROM profiles;
SELECT * FROM proposals;
SELECT * FROM user_limits;
SELECT * FROM payments;
```
All should return empty results (no errors).

---

## 🗄️ Database Structure

### Tables Created:
1. **profiles** - User profile data (name, department, batch, etc.)
2. **skills** - User skills (many-to-many)
3. **interests** - User interests (many-to-many)
4. **proposals** - Collaboration proposals between users
5. **swipes** - Track swiping history
6. **payments** - Payment records for unlocking unlimited proposals
7. **user_limits** - Track proposal limits (2 free, then pay)

### Key Features:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Automatic user_limits creation on signup
- ✅ Function to check if user can send proposals
- ✅ Unique constraints to prevent duplicate proposals/swipes
- ✅ Indexed columns for fast queries

---

## 💰 Payment Flow

1. User tries to send 3rd proposal → Blocked
2. Payment modal appears
3. User sends PKR 250 to IBAN
4. User uploads screenshot + submits
5. Admin verifies payment (manual for now)
6. `has_paid` flag set to true
7. User gets unlimited proposals

### Admin Verification (Manual Process):
```sql
-- View pending payments
SELECT 
  p.id,
  pr.name,
  pr.email,
  p.screenshot_url,
  p.transaction_details,
  p.created_at
FROM payments p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- Verify a payment
UPDATE payments 
SET status = 'verified', 
    verified_at = NOW()
WHERE id = 'payment-id-here';

-- Update user's paid status
UPDATE user_limits 
SET has_paid = TRUE 
WHERE user_id = 'user-id-here';
```

---

## 🔐 Authentication Flow

### Signup:
1. User fills form on `/login` page
2. Calls `signUp(email, password, profileData)`
3. Creates auth.users entry
4. Creates profiles entry with same ID
5. Triggers auto-creation of user_limits

### Login:
1. User enters credentials
2. Calls `signIn(email, password)`
3. Sets Supabase session
4. Redirects to `/swipe`

### Protected Routes:
All pages check for authentication using:
```typescript
const user = await getCurrentUser();
if (!user) redirect('/login');
```

---

## 🎯 Next Steps (Integration)

### Files to Update:
1. ✅ Created: `.env.local`, `lib/supabase/client.ts`, `lib/supabase/api.ts`
2. ✅ Created: `components/PaymentModal.tsx`
3. ✅ Created: `supabase/schema.sql`
4. 🔄 **Need to update:**
   - `app/login/page.tsx` - Add auth integration
   - `app/swipe/page.tsx` - Load real profiles from Supabase
   - `app/proposals/page.tsx` - Load real proposals
   - `app/proposals/[id]/page.tsx` - Update proposal status
   - `app/profile/page.tsx` - Load user profile
   - `app/profile/edit/page.tsx` - Save profile changes
   - `components/SwipeCard.tsx` - Send proposal to Supabase

### Testing Checklist:
- [ ] Can sign up new user
- [ ] Can log in existing user
- [ ] Profile created in database
- [ ] Can update profile
- [ ] Can see other users in swipe
- [ ] Can send proposal (first 2 work)
- [ ] 3rd proposal shows payment modal
- [ ] Can upload payment screenshot
- [ ] Admin can verify payment
- [ ] After payment, unlimited proposals work

---

## 🛠️ Troubleshooting

### Error: "relation 'profiles' does not exist"
→ Run the schema.sql file in SQL Editor

### Error: "new row violates row-level security policy"
→ Check RLS policies are created correctly

### Error: "Failed to upload screenshot"
→ Check storage bucket exists and policies are set

### Error: "Cannot send proposal - limit reached"
→ Check user_limits table has record for user

---

## 📞 Support

If you need help:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Check SQL queries run without errors

---

## 🎉 Ready to Launch!

Once setup is complete:
1. Test signup/login flow
2. Test swiping and proposals
3. Test payment flow end-to-end
4. Deploy to production
5. Update environment variables in production

**Database Connection String (for manual access):**
```
postgresql://postgres:shahmeer124@db.upphblfmgwqzjzunlhli.supabase.co:5432/postgres
```

⚠️ **IMPORTANT**: Never commit `.env.local` to git. Add it to `.gitignore`.
