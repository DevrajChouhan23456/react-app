import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const isServer = typeof window === 'undefined';

const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim();

if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project.supabase.co') {
  throw new Error(
    'Missing Supabase URL. Set EXPO_PUBLIC_SUPABASE_URL in react-app/.env and restart Expo.',
  );
}

if (!SUPABASE_KEY || SUPABASE_KEY === 'your-anon-key') {
  throw new Error(
    'Missing Supabase API key. Set EXPO_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_KEY in react-app/.env and restart Expo.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: isServer ? serverStorage : AsyncStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});
