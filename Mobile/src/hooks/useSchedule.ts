/**
 * useSchedule.ts (Mobile App)
 *
 * Reads and writes the user's weekly workout schedule from the shared
 * Supabase `scheduled_workouts` table. Realtime subscription ensures
 * changes from the web app appear instantly on mobile (and vice versa).
 *
 * Data is always filtered by the authenticated user.id — User A never
 * sees User B's schedule.
 */
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import {
  fetchSchedule,
  addScheduledWorkout,
  removeScheduledWorkout,
  subscribeToSchedule,
  ScheduledWorkoutRow,
} from '../lib/supabaseSync';

/** The schedule shape the UI works with: day → list of workout entries */
export type DaySchedule = Record<string, ScheduledWorkoutRow[]>;

const STORAGE_KEY = '@user_schedule_v2';

function rowsToSchedule(rows: ScheduledWorkoutRow[]): DaySchedule {
  const map: DaySchedule = {};
  for (const row of rows) {
    if (!map[row.scheduled_day]) map[row.scheduled_day] = [];
    map[row.scheduled_day].push(row);
  }
  return map;
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof subscribeToSchedule> | null>(null);

  // ── On mount: load from cache then sync from Supabase ──
  useEffect(() => {
    const init = async () => {
      // 1. Show cached data instantly
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) setSchedule(JSON.parse(cached));
      } catch {}

      // 2. Get authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // 3. Load from Supabase (source of truth, user-scoped)
      try {
        const rows = await fetchSchedule(uid);
        const mapped = rowsToSchedule(rows);
        setSchedule(mapped);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      } catch (err) {
        console.warn('[useSchedule] Load failed, using cache:', err);
      } finally {
        setIsLoading(false);
      }

      // 4. Realtime subscription — fires when web app changes schedule
      channelRef.current?.unsubscribe();
      channelRef.current = subscribeToSchedule(uid, async (rows) => {
        const mapped = rowsToSchedule(rows);
        setSchedule(mapped);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      });
    };

    init();

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        fetchSchedule(uid).then(async (rows) => {
          const mapped = rowsToSchedule(rows);
          setSchedule(mapped);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        });
      } else {
        setUserId(null);
        setSchedule({});
        AsyncStorage.removeItem(STORAGE_KEY);
        channelRef.current?.unsubscribe();
        channelRef.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
      channelRef.current?.unsubscribe();
    };
  }, []);

  // ── Add a workout to a day (optimistic + Supabase write) ──
  const addWorkout = async (day: string, workoutId: string, workoutName: string) => {
    const tempRow: ScheduledWorkoutRow = {
      id: `temp-${Date.now()}`,
      workout_id: workoutId,
      workout_name: workoutName,
      scheduled_day: day,
      created_at: new Date().toISOString(),
    };

    setSchedule(prev => {
      const dayList = prev[day] || [];
      if (dayList.some(r => r.workout_id === workoutId)) return prev;
      return { ...prev, [day]: [...dayList, tempRow] };
    });

    if (!userId) return;
    await addScheduledWorkout(userId, workoutId, workoutName, day);
    // Realtime will refresh with the real DB row
  };

  // ── Remove a workout from a day (optimistic + Supabase delete) ──
  const removeWorkout = async (day: string, workoutId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(r => r.workout_id !== workoutId),
    }));

    if (!userId) return;
    await removeScheduledWorkout(userId, workoutId, day);
  };

  return { schedule, addWorkout, removeWorkout, isLoading };
}
