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
  isRetrying: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isRetrying: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadProfile = async (userId: string, retryCount = 0) => {
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
          
          // Exponential backoff: 500ms, 1s, 2s, 4s, 8s (max 5 retries for high concurrency)
          if (retryCount < 5) {
            setIsRetrying(true);
            const delay = Math.min(500 * Math.pow(2, retryCount), 8000);
            console.log(`Retrying profile load (${retryCount + 1}/5) after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            await loadProfile(userId, retryCount + 1);
            return;
          }
          
          setIsRetrying(false);
          
          // Try to create profile from user metadata
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.user_metadata) {
            const { name, campus, batch, department } = user.user_metadata;
            // Ensure name is never email - use "New User" as fallback
            const safeName = (name && !name.includes('@')) ? name : 'New User';
            
            console.log('Creating profile with metadata:', { name: safeName, campus, batch, department });
            
            if (campus && batch && department) {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  email: user.email!,
                  name: safeName,
                  campus,
                  batch,
                  department,
                })
                .select()
                .single();
              
              if (!insertError && newProfile) {
                console.log('Profile created successfully');
                setIsRetrying(false);
                setProfile(newProfile as Profile);
                return;
              } else {
                console.error('Error creating profile:', insertError);
                setIsRetrying(false);
                setProfile(null);
                return;
              }
            } else {
              console.error('Missing required metadata:', { name, campus, batch, department });
            }
          } else {
            console.error('No user metadata found');
          }
          // If we can't create profile, set to null and continue
          console.log('Cannot create profile - missing metadata');
          setIsRetrying(false);
          setProfile(null);
          return;
        }
        console.error('Error loading profile:', error);
        setIsRetrying(false);
        setProfile(null);
        return;
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
        isRetrying,
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
