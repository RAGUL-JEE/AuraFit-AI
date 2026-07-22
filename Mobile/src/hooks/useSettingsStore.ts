import { useEffect } from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

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
  loadCache: () => Promise<void>;
  syncSettings: (userId: string, newSettings: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  channel: null,

  setSettings: (newSettings) => {
    set(state => {
      const updated = { ...state.settings, ...newSettings };
      AsyncStorage.setItem('user_settings', JSON.stringify(updated)).catch(() => {});
      return { settings: updated };
    });
  },

  loadCache: async () => {
    try {
      const stored = await AsyncStorage.getItem('user_settings');
      if (stored) {
        set({ settings: JSON.parse(stored) });
      }
    } catch {}
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
      if (error) console.warn('Failed to sync settings', error);
    } catch (err) {}
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
    } catch (err) {}

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
  const store = useSettingsStore();

  useEffect(() => {
    store.loadCache();
    
    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        store.init(session.user.id);
      }
    };
    setup();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        store.init(session.user.id);
      } else {
        store.cleanup();
      }
    });

    return () => {
      subscription.unsubscribe();
      store.cleanup();
    };
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      store.syncSettings(session.user.id, newSettings);
    } else {
      store.setSettings(newSettings);
    }
  };

  return { settings: store.settings, updateSettings };
}
