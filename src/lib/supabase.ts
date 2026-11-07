import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const getStoredCredentials = () => {
  const storedUrl = localStorage.getItem('smart_farm_supabase_url');
  const storedKey = localStorage.getItem('smart_farm_supabase_key');
  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey,
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredCredentials();
  if (!url || !key) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('http'));
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('smart_farm_supabase_url', url.trim());
  localStorage.setItem('smart_farm_supabase_key', key.trim());
  supabaseInstance = null; // reset to reinitialize
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('smart_farm_supabase_url');
  localStorage.removeItem('smart_farm_supabase_key');
  supabaseInstance = null;
};

export const getActiveSupabaseConfig = () => {
  return getStoredCredentials();
};
