/**
 * useFavorites.ts (Mobile App)
 *
 * Syncs favorite workouts to the shared Supabase `favorites` table.
 * Supports Realtime — when the user favorites on the web app, the mobile
 * automatically reflects the change.
 */
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  subscribeToFavorites,
} from '../lib/supabaseSync';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToFavorites> | null>(null);

  // ── On mount: get current user and load favorites from Supabase ──
  useEffect(() => {
    const init = async () => {
      // Load from AsyncStorage instantly while Supabase loads
      try {
        const cached = await AsyncStorage.getItem('workout_favorites');
        if (cached) setFavorites(JSON.parse(cached));
      } catch {}

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoaded(true);
        return;
      }

      setUserId(user.id);

      // Load from Supabase (source of truth)
      const remote = await fetchFavorites(user.id);

      if (remote.length > 0) {
        setFavorites(remote);
        await AsyncStorage.setItem('workout_favorites', JSON.stringify(remote));
      } else {
        // Seed Supabase from AsyncStorage if remote is empty but local has data
        const cached = await AsyncStorage.getItem('workout_favorites');
        const local: string[] = cached ? JSON.parse(cached) : [];
        if (local.length > 0) {
          for (const id of local) {
            await addFavorite(user.id, id);
          }
          setFavorites(local);
        }
      }

      setIsLoaded(true);

      // Subscribe to Realtime (e.g. user changes favorites on web app)
      channelRef.current?.unsubscribe();
      channelRef.current = subscribeToFavorites(user.id, async (updated) => {
        setFavorites(updated);
        await AsyncStorage.setItem('workout_favorites', JSON.stringify(updated));
      });
    };

    init();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchFavorites(session.user.id).then(async (remote) => {
          setFavorites(remote);
          await AsyncStorage.setItem('workout_favorites', JSON.stringify(remote));
        });
      } else {
        setUserId(null);
        setFavorites([]);
        channelRef.current?.unsubscribe();
        channelRef.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
      channelRef.current?.unsubscribe();
    };
  }, []);

  // ── Toggle a favorite (optimistic update + Supabase write) ──
  const toggleFavorite = async (id: string) => {
    const isCurrentlyFav = favorites.includes(id);

    // Optimistic update
    const updated = isCurrentlyFav
      ? favorites.filter(f => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    await AsyncStorage.setItem('workout_favorites', JSON.stringify(updated));

    if (!userId) return;

    if (isCurrentlyFav) {
      await removeFavorite(userId, id);
    } else {
      await addFavorite(userId, id);
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
