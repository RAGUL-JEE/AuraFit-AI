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
    // Check for an active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAndSyncProfile(session.user);
      } else {
        setIsCheckingSession(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAndSyncProfile(session.user);
      } else {
        setIsCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetches the user's profile from the shared Supabase `users` table.
   * If the row doesn't exist yet (e.g. first Google login), auto-inserts it.
   * This guarantees the mobile app and website share the same user record.
   */
  const fetchAndSyncProfile = async (currentUser: User) => {
    try {
      // Try 'profiles' table first (used by useUserProfile hook for extended data)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData && !profileError) {
        updateProfile({
          fullName: profileData.full_name || profileData.name || '',
          email: profileData.email || currentUser.email || '',
          username: profileData.username || (profileData.full_name
            ? `@${profileData.full_name.replace(/\s+/g, '').toLowerCase()}_fit`
            : `@${currentUser.email?.split('@')[0]}_fit`),
          phoneNumber: profileData.phone_number || '',
          location: profileData.location || '',
          age: profileData.age || 28,
          weight: profileData.weight || 78,
          height: profileData.height || 182,
          bodyFat: profileData.body_fat || 14,
          fitnessGoal: profileData.fitness_goal || 'Hypertrophy & Strength',
          bio: profileData.bio || '',
          avatarUrl: profileData.avatar_url || '',
          joinedDate: profileData.joined_date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
      } else {
        // Fall back to the 'users' table (used by the website auth system)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (userData && !userError) {
          updateProfile({
            fullName: userData.name || '',
            email: userData.email || currentUser.email || '',
            username: userData.name
              ? `@${userData.name.replace(/\s+/g, '').toLowerCase()}_fit`
              : `@${currentUser.email?.split('@')[0]}_fit`,
          });
        } else if (userError?.code === 'PGRST116') {
          // User not in public.users — insert them (handles Google OAuth first login)
          const metadata = currentUser.user_metadata || {};
          const fullName = metadata.full_name || metadata.name || currentUser.email?.split('@')[0] || 'User';

          await supabase.from('users').insert({
            id: currentUser.id,
            name: fullName,
            email: currentUser.email,
          });

          updateProfile({
            fullName,
            email: currentUser.email || '',
            username: `@${fullName.replace(/\s+/g, '').toLowerCase()}_fit`,
          });
        }
      }
    } catch (err) {
      console.error('Error syncing profile on login:', err);
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
