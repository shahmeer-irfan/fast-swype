// Auth Context Provider for managing user authentication state
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          skills (skill),
          interests (interest)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist, might be new confirmed user
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId);
          // Try to create profile from user metadata
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.user_metadata) {
            const { name, campus, batch, department } = user.user_metadata;
            // Ensure name is never email - use "New User" as fallback
            const safeName = (name && !name.includes('@')) ? name : 'New User';
            if (campus && batch && department) {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  email: user.email!,
                  name: safeName,
                  campus,
                  batch,
                  department,
                });
              
              if (!insertError) {
                // Reload profile after creation
                await loadProfile(userId);
                return;
              }
            }
          }
        }
        throw error;
      }
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
