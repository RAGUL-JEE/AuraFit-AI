import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface UserSettings {
  theme: string;
  notifications: boolean;
  units: string;
  language: string;
  preferences: Record<string, any>;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  notifications: true,
  units: 'metric',
  language: 'en',
  preferences: {}
};

interface SettingsStore {
  settings: UserSettings;
  channel: any;
  init: (userId: string) => void;
  cleanup: () => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  syncSettings: (userId: string, newSettings: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: (() => {
    try {
      const stored = localStorage.getItem('user_settings');
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  })(),
  channel: null,

  setSettings: (newSettings) => {
    set(state => {
      const updated = { ...state.settings, ...newSettings };
      localStorage.setItem('user_settings', JSON.stringify(updated));
      return { settings: updated };
    });
  },

  syncSettings: async (userId: string, newSettings: Partial<UserSettings>) => {
    get().setSettings(newSettings);
    
    // Sync to Supabase
    try {
      const { error } = await supabase.from('settings').upsert({
        user_id: userId,
        ...newSettings,
        updated_at: new Date().toISOString()
      });
      if (error) console.error('Failed to sync settings to Supabase', error);
    } catch (err) {
      console.error('Error syncing settings:', err);
    }
  },

  init: async (userId: string) => {
    get().cleanup();

    // Load from DB
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('user_id', userId).single();
      if (!error && data) {
        get().setSettings({
          theme: data.theme,
          notifications: data.notifications,
          units: data.units,
          language: data.language,
          preferences: data.preferences
        });
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }

    // Subscribe to changes
    const channel = supabase
      .channel(`settings:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          const { new: data } = payload;
          if (data) {
            get().setSettings({
              theme: data.theme,
              notifications: data.notifications,
              units: data.units,
              language: data.language,
              preferences: data.preferences
            });
          }
        }
      )
      .subscribe();

    set({ channel });
  },

  cleanup: () => {
    const { channel } = get();
    if (channel) channel.unsubscribe();
    set({ channel: null });
  }
}));

export function useSettings() {
  const { session } = useAuth();
  const store = useSettingsStore();

  useEffect(() => {
    if (session?.user?.id) {
      store.init(session.user.id);
    } else {
      store.cleanup();
    }
    return () => store.cleanup();
  }, [session?.user?.id]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (session?.user?.id) {
      store.syncSettings(session.user.id, newSettings);
    } else {
      store.setSettings(newSettings);
    }
  };

  return { settings: store.settings, updateSettings };
}
