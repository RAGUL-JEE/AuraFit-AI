/**
 * useFavorites.ts (Web App)
 *
 * Syncs favorite workouts to the shared Supabase `favorites` table.
 * Supports Realtime — when the user favorites on mobile, the web
 * automatically reflects the change.
 */
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  subscribeToFavorites,
} from '../lib/supabaseSync';
import { EXERCISES } from '../data/exercises';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('workout_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToFavorites> | null>(null);

  // ── On mount: get current user and load favorites from Supabase ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Load from Supabase (source of truth)
      const remote = await fetchFavorites(user.id);
      if (remote.length > 0 || localStorage.getItem('workout_favorites') === null) {
        setFavorites(remote);
        localStorage.setItem('workout_favorites', JSON.stringify(remote));
      } else {
        // Seed Supabase from localStorage if remote is empty but local has data
        const local: string[] = JSON.parse(localStorage.getItem('workout_favorites') || '[]');
        if (local.length > 0) {
          for (const id of local) {
            await addFavorite(user.id, id);
          }
          setFavorites(local);
        }
      }

      // Subscribe to Realtime changes (e.g. user changes favorites on mobile)
      channelRef.current = subscribeToFavorites(user.id, (updated) => {
        setFavorites(updated);
        localStorage.setItem('workout_favorites', JSON.stringify(updated));
      });
    };

    init();

    // Auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchFavorites(session.user.id).then((remote) => {
          setFavorites(remote);
          localStorage.setItem('workout_favorites', JSON.stringify(remote));
        });
      } else {
        setUserId(null);
        setFavorites([]);
        // Unsubscribe from Realtime
        channelRef.current?.unsubscribe();
        channelRef.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
      channelRef.current?.unsubscribe();
    };
  }, []);

  // ── Persist to localStorage whenever favorites change ──
  useEffect(() => {
    localStorage.setItem('workout_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ── Toggle a favorite (optimistic update + Supabase write) ──
  const toggleFavorite = async (id: string) => {
    const isCurrentlyFav = favorites.includes(id);

    // Optimistic update
    setFavorites(prev =>
      isCurrentlyFav ? prev.filter(f => f !== id) : [...prev, id]
    );

    if (!userId) return;

    if (isCurrentlyFav) {
      await removeFavorite(userId, id);
    } else {
      await addFavorite(userId, id);
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);
  const favoriteExercises = EXERCISES.filter(ex => favorites.includes(ex.id));

  return { favorites, toggleFavorite, isFavorite, favoriteExercises };
}
