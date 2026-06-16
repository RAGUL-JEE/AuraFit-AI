import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egeahlmqxbzqeiqsrobq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZWFobG1xeGJ6cWVpcXNyb2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTU4NDQsImV4cCI6MjA5NjgzMTg0NH0.yO_zZqHkVwBPQfQx8XFic0sXJR3lgQ8sSQBLvxVz4bQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
