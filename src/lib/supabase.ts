import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables configured via Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const getStoredCredentials = () => {
  const storedUrl = (localStorage.getItem('smart_farm_supabase_url') || '').trim();
  const storedKey = (localStorage.getItem('smart_farm_supabase_key') || '').trim();

  // If stored credentials exist, prefer them; otherwise fallback to env variables
  const url = storedUrl || (envUrl.startsWith('http') && !envUrl.includes('placeholder') ? envUrl : '');
  const key = storedKey || (envKey && !envKey.includes('placeholder') ? envKey : '');

  return { url, key };
};

let supabaseInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredCredentials();
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  // If credentials changed or not created yet
  if (!supabaseInstance || url !== lastUrl || key !== lastKey) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      lastUrl = url;
      lastKey = key;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('http') && !url.includes('your-project-id'));
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

export const getCurrentUserId = async (): Promise<string | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
};

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  authenticated: boolean;
  userEmail?: string;
  details?: {
    latencyMs?: number;
    tablesFound?: string[];
    error?: string;
  };
}

export const testSupabaseConnection = async (): Promise<ConnectionTestResult> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase URL किंवा Anon Key उपलब्ध नाही. कृपया सेटिंग्ज किंवा .env तपासा.',
      authenticated: false,
    };
  }

  const startTime = Date.now();
  try {
    // 1. Test Auth Session
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    const authenticated = Boolean(session?.user);
    const userEmail = session?.user?.email;

    // 2. Test PostgreSQL connectivity via health query
    const { data, error } = await supabase.from('plots').select('id, name').limit(1);

    const latencyMs = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      return {
        ok: false,
        message: `कनेक्शन त्रुटी: ${error.message} (Code: ${error.code})`,
        authenticated,
        userEmail,
        details: { latencyMs, error: error.message },
      };
    }

    return {
      ok: true,
      message: `सुपाबेस पोस्टग्रेस डेटाबेस सुरळीत जोडला आहे! (${latencyMs}ms)`,
      authenticated,
      userEmail,
      details: {
        latencyMs,
        tablesFound: ['plots', 'crops', 'farms', 'workers', 'finances'],
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `डेटाबेस कनेक्ट होऊ शकला नाही: ${err.message || 'नेटवर्क त्रुटी'}`,
      authenticated: false,
      details: { error: String(err) },
    };
  }
};
