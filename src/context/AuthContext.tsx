import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { FarmDB } from '../services/db';
import { setAppLanguage } from '../i18n';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isCloudConnected: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateLanguage: (lang: 'mr' | 'hi' | 'en') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const configured = isSupabaseConfigured();
      setIsCloudConnected(configured);

      // Load profile (cloud or local)
      const prof = await FarmDB.getProfile();
      setProfile(prof);

      // Restore language preference
      if (prof.language_preference) {
        setAppLanguage(prof.language_preference);
      }

      const supabase = getSupabaseClient();
      if (supabase && configured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
          }

          const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
              const updatedProfile = await FarmDB.getProfile();
              setProfile(updatedProfile);
              if (updatedProfile.language_preference) {
                setAppLanguage(updatedProfile.language_preference);
              }
            }
          });

          setLoading(false);
          return () => {
            authListener.subscription.unsubscribe();
          };
        } catch (err) {
          console.warn('Supabase auth initialization error', err);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const updateLanguage = async (lang: 'mr' | 'hi' | 'en') => {
    setAppLanguage(lang);
    if (profile) {
      setProfile({ ...profile, language_preference: lang });
    }
    await FarmDB.updateLanguagePreference(lang);
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured in Database Settings.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured in Database Settings.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            language_preference: profile?.language_preference || 'mr',
          },
        },
      });
      if (error) return { success: false, error: error.message };
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isCloudConnected,
        signIn,
        signUp,
        signOut,
        updateLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
