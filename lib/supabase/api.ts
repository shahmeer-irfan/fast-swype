import { supabase } from './client';
import type { Profile, Proposal } from './client';

// =====================================================
// AUTH FUNCTIONS
// =====================================================

export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  campus: string;
  batch: string;
  department: string;
}) {
  const { email, password, name, campus, batch, department } = data;
  
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/login?verified=true`,
        data: {
          name,
          campus,
          batch,
          department,
        }
      }
    });

    if (authError) {
      // Check for specific error messages
      if (authError.message?.toLowerCase().includes('already') || 
          authError.message?.toLowerCase().includes('registered')) {
        return { 
          data: null, 
          error: { message: 'This email is already registered. Please log in instead.' } 
        };
      }
      return { 
        data: null, 
        error: { message: authError.message || 'Email already registered or invalid' } 
      };
    }
    
    if (!authData.user) {
      return { 
        data: null, 
        error: { message: 'Failed to create account. Please try again.' } 
      };
    }

    // 2. Check if this is a repeated signup (user already exists but not confirmed)
    // When a user exists, Supabase returns the user but with no session
    // We need to check if they're already confirmed
    if (authData.user && !authData.session) {
      // Email confirmation required - profile will be created by database trigger after verification
      console.log('Email confirmation required for:', email);
      return { 
        data: authData, 
        error: null
      };
    }

    // 3. If session exists (auto-confirmed), profile will be created by trigger
    // No need to manually create it here
    return { data: authData, error: null };
  } catch (err) {
    console.error('Signup error:', err);
    return { 
      data: null, 
      error: { message: 'An unexpected error occurred. Please try again.' } 
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { 
        data: null, 
        error: { message: 'Invalid email or password' } 
      };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Login error:', err);
    return { 
      data: null, 
      error: { message: 'Login failed. Please try again.' } 
    };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile/edit?welcome=true`,
      }
    });

    if (error) {
      return { 
        success: false, 
        error: { message: 'Failed to resend email. Please try again.' } 
      };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Resend email error:', err);
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred.' } 
    };
  }
}

export async function createProfileFromMetadata(userId: string) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: { message: 'User not found' } };
    }

    const { name, campus, batch, department } = user.user_metadata;
    
    if (!name || !campus || !batch || !department) {
      return { success: false, error: { message: 'Missing user metadata' } };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email!,
        name,
        campus,
        batch,
        department,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { success: false, error: { message: 'Failed to create profile' } };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Create profile error:', err);
    return { success: false, error: { message: 'An unexpected error occurred' } };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// =====================================================
// PROFILE FUNCTIONS
// =====================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      skills(*),
      interests(*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllProfiles(excludeUserId?: string): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      skills(*),
      interests(*)
    `);

  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getUnswipedProfiles(userId: string) {
  // Get profiles where user has sent proposals (exclude these forever)
  const { data: proposalIds } = await supabase
    .from('proposals')
    .select('to_user_id')
    .eq('from_user_id', userId);

  const proposalUserIds = proposalIds?.map(p => p.to_user_id) || [];

  // Get all profiles except current user and users who already received proposals
  let query = supabase
    .from('profiles')
    .select(`
      *,
      skills(*),
      interests(*)
    `)
    .neq('id', userId);

  // Only exclude profiles where user has sent proposals, not just swiped left
  if (proposalUserIds.length > 0) {
    query = query.not('id', 'in', `(${proposalUserIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSkills(userId: string, skills: string[]) {
  // Delete existing skills
  await supabase.from('skills').delete().eq('user_id', userId);

  // Insert new skills
  if (skills.length > 0) {
    const { error } = await supabase
      .from('skills')
      .insert(skills.map(skill => ({ user_id: userId, skill })));

    if (error) return { error };
  }
  return { error: null };
}

export async function updateInterests(userId: string, interests: string[]) {
  // Delete existing interests
  await supabase.from('interests').delete().eq('user_id', userId);

  // Insert new interests
  if (interests.length > 0) {
    const { error } = await supabase
      .from('interests')
      .insert(interests.map(interest => ({ user_id: userId, interest })));

    if (error) return { error };
  }
  return { error: null };
}

export async function uploadProfilePicture(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProfilePicture(userId: string, url: string) {
  // Extract file path from URL
  const urlParts = url.split('/profile-pictures/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1]; // This will be "userId/filename.ext"
  
  await supabase.storage
    .from('profile-pictures')
    .remove([filePath]);
}

// =====================================================
// PROPOSAL FUNCTIONS
// =====================================================

export async function canSendProposal(userId: string) {
  const { data, error } = await supabase.rpc('can_send_proposal', { user_uuid: userId });
  if (error) return { canSend: false, error };
  return { canSend: data as boolean, error: null };
}

export async function getUserLimits(userId: string) {
  const { data, error } = await supabase
    .from('user_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProposalCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('from_user_id', userId);

  if (error) throw error;
  return count || 0;
}

export async function sendProposal(toUserId: string, message: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Check if can send
  const { canSend } = await canSendProposal(user.id);
  if (!canSend) {
    throw new Error('PROPOSAL_LIMIT_REACHED');
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReceivedProposals(userId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      from_profile:profiles!proposals_from_user_id_fkey(*)
    `)
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

export async function getSentProposals(userId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      to_profile:profiles!proposals_to_user_id_fkey(*)
    `)
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

export async function updateProposalStatus(proposalId: string, status: 'accepted' | 'rejected') {
  const { data, error } = await supabase
    .from('proposals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// SWIPE FUNCTIONS
// =====================================================

export async function recordSwipe(userId: string, swipedUserId: string, direction: 'left' | 'right') {
  const { data, error } = await supabase
    .from('swipes')
    .insert({
      user_id: userId,
      swiped_user_id: swipedUserId,
      direction,
    })
    .select()
    .single();

  if (error) return { error };
  return { data, error: null };
}

// =====================================================
// PAYMENT FUNCTIONS
// =====================================================

export async function createPayment(transactionDetails: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Creating payment for user:', user.id);

  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      amount: 250,
      transaction_details: transactionDetails,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Payment creation error:', error);
    throw new Error('Failed to submit payment. Please try again or contact support.');
  }
  return data;
}

export async function uploadPaymentScreenshot(file: File, paymentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${paymentId}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Update payment record with screenshot URL
  const { data, error } = await supabase
    .from('payments')
    .update({ screenshot_url: uploadData.path })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPaymentStatus(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}
