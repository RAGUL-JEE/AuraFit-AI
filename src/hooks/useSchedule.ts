/**
 * useSchedule.ts (Web App)
 *
 * Reads and writes the user's weekly workout schedule from the shared
 * Supabase `scheduled_workouts` table. Realtime subscription ensures
 * changes from the mobile app appear instantly on the web (and vice versa).
 *
 * Data is always filtered by the authenticated user.id — User A never
 * sees User B's schedule.
 */
import { useState, useEffect, useRef } from 'react';
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

function rowsToSchedule(rows: ScheduledWorkoutRow[]): DaySchedule {
  const map: DaySchedule = {};
  for (const row of rows) {
    if (!map[row.scheduled_day]) map[row.scheduled_day] = [];
    map[row.scheduled_day].push(row);
  }
  return map;
}

const STORAGE_KEY = 'user_schedule_v2';

export function useSchedule() {
  const [schedule, setSchedule] = useState<DaySchedule>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof subscribeToSchedule> | null>(null);

  // ── On mount: get auth user and load schedule from Supabase ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      try {
        const rows = await fetchSchedule(user.id);
        const mapped = rowsToSchedule(rows);
        setSchedule(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      } catch (err) {
        console.warn('[useSchedule] Load failed, using cache:', err);
      } finally {
        setIsLoading(false);
      }

      // Realtime — fires when mobile app adds/removes a scheduled workout
      channelRef.current?.unsubscribe();
      channelRef.current = subscribeToSchedule(user.id, (rows) => {
        const mapped = rowsToSchedule(rows);
        setSchedule(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      });
    };

    init();

    // Auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchSchedule(session.user.id).then((rows) => {
          const mapped = rowsToSchedule(rows);
          setSchedule(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        });
      } else {
        setUserId(null);
        setSchedule({});
        localStorage.removeItem(STORAGE_KEY);
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
    // Optimistic update
    const tempRow: ScheduledWorkoutRow = {
      id: `temp-${Date.now()}`,
      workout_id: workoutId,
      workout_name: workoutName,
      scheduled_day: day,
      created_at: new Date().toISOString(),
    };

    setSchedule(prev => {
      const dayList = prev[day] || [];
      // Prevent duplicate
      if (dayList.some(r => r.workout_id === workoutId)) return prev;
      const next = { ...prev, [day]: [...dayList, tempRow] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (!userId) return;
    await addScheduledWorkout(userId, workoutId, workoutName, day);
    // Realtime will update the list with the real row from DB
  };

  // ── Remove a workout from a day (optimistic + Supabase delete) ──
  const removeWorkout = async (day: string, workoutId: string) => {
    // Optimistic update
    setSchedule(prev => {
      const next = {
        ...prev,
        [day]: (prev[day] || []).filter(r => r.workout_id !== workoutId),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (!userId) return;
    await removeScheduledWorkout(userId, workoutId, day);
  };

  return { schedule, addWorkout, removeWorkout, isLoading };
}
