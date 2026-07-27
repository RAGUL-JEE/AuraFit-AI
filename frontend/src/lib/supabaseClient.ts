// Re-export official Supabase client initialized in supabase.js
import { supabase as client } from './supabase.js';

export const supabase = client;
