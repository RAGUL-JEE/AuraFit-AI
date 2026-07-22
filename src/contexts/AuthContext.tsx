import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUserProfile } from '../hooks/useUserProfile';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isCheckingSession: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { updateProfile } = useUserProfile();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setIsCheckingSession(false);
      }
    });

    // Listen for auth changes (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setIsCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        updateProfile({
          fullName: data.name || '',
          email: data.email || '',
          username: data.name ? `@${data.name.replace(/\s+/g, '').toLowerCase()}_fit` : '',
        });
      } else if (error && error.code === 'PGRST116') {
        // User not found in public.users table (e.g. Google OAuth login)
        // Auto-insert them using their auth metadata
        const metadata = currentUser.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || currentUser.email?.split('@')[0] || 'User';
        
        await supabase.from('users').insert({
          id: currentUser.id,
          name: fullName,
          email: currentUser.email,
        });

        updateProfile({
          fullName: fullName,
          email: currentUser.email || '',
          username: `@${fullName.replace(/\s+/g, '').toLowerCase()}_fit`,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isCheckingSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
