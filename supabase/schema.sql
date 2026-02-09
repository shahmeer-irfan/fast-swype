-- =====================================================
-- SWYPE FYP Matching App - Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL, -- CS, AI, SE, etc.
  batch TEXT NOT NULL, -- 2021, 2022, etc.
  campus TEXT NOT NULL, -- Islamabad, Lahore, Karachi
  bio TEXT,
  domain TEXT, -- Full Stack, ML, Mobile, etc.
  looking_for TEXT, -- Research, Product, Startup, Easy FYP
  availability TEXT, -- Looking actively, Just exploring
  profile_picture_url TEXT, -- Optional profile picture
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table (many-to-many with users)
CREATE TABLE public.skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interests table (many-to-many with users)
CREATE TABLE public.interests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PROPOSALS TABLE
-- =====================================================
CREATE TABLE public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id) -- Prevent duplicate proposals
);

-- Index for faster queries
CREATE INDEX idx_proposals_from_user ON public.proposals(from_user_id);
CREATE INDEX idx_proposals_to_user ON public.proposals(to_user_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);

-- =====================================================
-- 3. SWIPES TABLE (track who user has seen)
-- =====================================================
CREATE TABLE public.swipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  swiped_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')), -- left = pass, right = interested
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, swiped_user_id) -- Prevent duplicate swipes
);

CREATE INDEX idx_swipes_user ON public.swipes(user_id);

-- =====================================================
-- 4. PAYMENTS TABLE
-- =====================================================
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 250,
  screenshot_url TEXT, -- Storage path for payment screenshot
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  transaction_details TEXT, -- User's notes about payment
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id), -- Admin who verified
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- =====================================================
-- 5. USER LIMITS (track proposal count)
-- =====================================================
CREATE TABLE public.user_limits (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposals_sent INT DEFAULT 0,
  proposals_limit INT DEFAULT 999999, -- Unlimited
  has_paid BOOLEAN DEFAULT FALSE,
  last_proposal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. FUNCTIONS
-- =====================================================

-- Function to count sent proposals
CREATE OR REPLACE FUNCTION public.count_sent_proposals(user_uuid UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.proposals WHERE from_user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can send proposals
CREATE OR REPLACE FUNCTION public.can_send_proposal(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- No limits — everyone can send unlimited proposals
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-create user_limits on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_limits (user_id, proposals_limit, has_paid)
  VALUES (NEW.id, 999999, TRUE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create profile on email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Only proceed if email is being confirmed (was null, now has value)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Check if profile doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      -- Get name from metadata, ensure it's not an email
      user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
      IF user_name LIKE '%@%' THEN
        user_name := 'New User';
      END IF;
      
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
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users (create user_limits)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for email confirmation (create profile)
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Function to update user_limits when proposal is sent
CREATE OR REPLACE FUNCTION public.update_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user_limits table
  INSERT INTO public.user_limits (user_id, proposals_sent, last_proposal_at)
  VALUES (NEW.from_user_id, 1, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    proposals_sent = public.user_limits.proposals_sent + 1,
    last_proposal_at = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update proposal count when proposal is created
CREATE TRIGGER on_proposal_created
  AFTER INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_count();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Skills: Users can manage their own skills
CREATE POLICY "Users can view all skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own skills"
  ON public.skills FOR ALL
  USING (auth.uid() = user_id);

-- Interests: Users can manage their own interests
CREATE POLICY "Users can view all interests"
  ON public.interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own interests"
  ON public.interests FOR ALL
  USING (auth.uid() = user_id);

-- Proposals: Users can see proposals they're involved in
CREATE POLICY "Users can view their proposals"
  ON public.proposals FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id AND can_send_proposal(auth.uid()));

CREATE POLICY "Recipients can update proposal status"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Swipes: Users can only see and manage their own
CREATE POLICY "Users can manage their own swipes"
  ON public.swipes FOR ALL
  USING (auth.uid() = user_id);

-- Payments: Users can see and create their own payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

-- User Limits: Users can view their own limits
CREATE POLICY "Users can view their own limits"
  ON public.user_limits FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. STORAGE BUCKET FOR PAYMENT SCREENSHOTS
-- =====================================================
-- Note: Create the storage bucket manually in Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Create new bucket named "payment-screenshots" (private)
-- 3. Set up policies in the Storage UI for user upload/view permissions
-- 
-- The storage policies need to be created through the Supabase Dashboard Storage UI,
-- not through this SQL script.
-- Update payment status to verified
UPDATE public.payments 
SET 
  status = 'verified',
  verified_at = NOW(),
  verified_by = auth.uid()  -- your admin user ID
WHERE id = 'PAYMENT_ID_HERE';

-- Enable unlimited proposals for the user
UPDATE public.user_limits 
SET 
  has_paid = TRUE,
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';

-- View all pending payments with user details
SELECT 
  p.*,
  pr.name,
  pr.email,
  pr.campus
FROM public.payments p
JOIN public.profiles pr ON p.user_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;