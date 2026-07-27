import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// These must match the website's Supabase project exactly.
// Credentials are loaded from Mobile/.env (EXPO_PUBLIC_* prefix).
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://urmnrxvnlnulgqfteahi.supabase.co';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_1bbyWpiLhxFX4bNmQXI-WA_6aH4CTrW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
