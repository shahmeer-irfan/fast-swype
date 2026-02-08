import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin client for operations that need to bypass RLS (server-side only)
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Types for database tables
export interface Profile {
  id: string;
  email: string;
  name: string;
  department: string;
  batch: string;
  campus: string;
  bio?: string;
  domain?: string;
  looking_for?: string;
  availability?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
  interests?: Interest[];
}

export interface Skill {
  id: string;
  user_id: string;
  skill: string;
  created_at: string;
}

export interface Interest {
  id: string;
  user_id: string;
  interest: string;
  created_at: string;
}

export interface Proposal {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  from_profile?: Profile;
  to_profile?: Profile;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  screenshot_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  transaction_details?: string;
  created_at: string;
}

export interface UserLimits {
  user_id: string;
  proposals_sent: number;
  proposals_limit: number;
  has_paid: boolean;
  last_proposal_at?: string;
}
