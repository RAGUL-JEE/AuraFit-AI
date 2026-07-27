/**
 * supabaseSync.ts (Web App)
 *
 * Centralized Supabase data layer shared between web and mobile apps.
 * All reads/writes use the authenticated user.id so data is always
 * the same regardless of which platform the user is on.
 */
import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────────────────────────

/** Fetch all favorite workout IDs for a user */
export async function fetchFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('workout_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[supabaseSync] fetchFavorites error:', error.message);
    return [];
  }
  return (data ?? []).map((row: any) => row.workout_id);
}

/** Add a workout to favorites */
export async function addFavorite(userId: string, workoutId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, workout_id: workoutId });

  if (error && error.code !== '23505') { // 23505 = unique violation (already favorited)
    console.warn('[supabaseSync] addFavorite error:', error.message);
    return false;
  }
  return true;
}

/** Remove a workout from favorites */
export async function removeFavorite(userId: string, workoutId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('workout_id', workoutId);

  if (error) {
    console.warn('[supabaseSync] removeFavorite error:', error.message);
    return false;
  }
  return true;
}

/** Subscribe to real-time changes on the favorites table for a user */
export function subscribeToFavorites(
  userId: string,
  onChange: (favorites: string[]) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`favorites:${userId}:${Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'favorites',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        // Re-fetch the full list on any change (insert or delete)
        const latest = await fetchFavorites(userId);
        onChange(latest);
      }
    )
    .subscribe();

  return channel;
}

// ─────────────────────────────────────────────────────────────────
// WORKOUT SESSIONS (unified history table for web + mobile)
// ─────────────────────────────────────────────────────────────────

export interface WorkoutSessionRow {
  id: string;
  user_id?: string;
  workout_name?: string;
  exercise_name?: string;
  exercise_id?: string;
  reps: number;
  sets: number;
  calories: number;
  duration?: number;
  duration_seconds?: number;
  accuracy: number;
  correct_reps?: number;
  incorrect_reps?: number;
  status?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

/** Fetch workout session history for a user */
export async function fetchWorkoutSessions(userId: string): Promise<WorkoutSessionRow[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.warn('[supabaseSync] fetchWorkoutSessions error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Save a new workout session */
export async function saveWorkoutSession(
  userId: string,
  session: Omit<WorkoutSessionRow, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const { error } = await supabase.from('workout_sessions').insert({
    user_id: userId,
    ...session,
    workout_name: session.workout_name || session.exercise_name || session.exercise_id,
    exercise_name: session.exercise_name || session.exercise_id,
    reps: Math.round(Number(session.reps) || 0),
    sets: Math.round(Number(session.sets) || 0),
    calories: Math.round(Number(session.calories) || 0),
    duration: Math.round(Number(session.duration ?? session.duration_seconds) || 0),
    duration_seconds: Math.round(Number(session.duration ?? session.duration_seconds) || 0),
    accuracy: Math.round(Number(session.accuracy) || 0),
    correct_reps: Math.round(Number(session.correct_reps ?? session.reps) || 0),
    incorrect_reps: Math.round(Number(session.incorrect_reps) || 0),
    status: session.status || 'completed',
    started_at: session.started_at || new Date().toISOString(),
    completed_at: session.completed_at || new Date().toISOString(),
  });

  if (error) {
    console.warn('[supabaseSync] saveWorkoutSession error:', error.message);
    return false;
  }
  return true;
}

/** Subscribe to real-time changes on workout_sessions for a user */
export function subscribeToWorkoutSessions(
  userId: string,
  onChange: (sessions: WorkoutSessionRow[]) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`workout_sessions:${userId}:${Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'workout_sessions',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const latest = await fetchWorkoutSessions(userId);
        onChange(latest);
      }
    )
    .subscribe();

  return channel;
}

// ─────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────

/** Subscribe to real-time profile changes for a user */
export function subscribeToProfile(
  userId: string,
  onChange: (profile: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`profile:${userId}:${Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        onChange(payload.new);
      }
    )
    .subscribe();

  return channel;
}

// ─────────────────────────────────────────────────────────────────
// SCHEDULED WORKOUTS
// ─────────────────────────────────────────────────────────────────

export interface ScheduledWorkoutRow {
  id: string;
  workout_id: string;
  workout_name: string;
  scheduled_day: string;
  created_at: string;
}

/** Fetch all scheduled workouts for a user, grouped by day */
export async function fetchSchedule(userId: string): Promise<ScheduledWorkoutRow[]> {
  const { data, error } = await supabase
    .from('scheduled_workouts')
    .select('id, workout_id, workout_name, scheduled_day, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[supabaseSync] fetchSchedule error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Add a workout to a specific day in the user's schedule */
export async function addScheduledWorkout(
  userId: string,
  workoutId: string,
  workoutName: string,
  scheduledDay: string
): Promise<boolean> {
  const { error } = await supabase.from('scheduled_workouts').insert({
    user_id: userId,
    workout_id: workoutId,
    workout_name: workoutName,
    scheduled_day: scheduledDay,
  });

  if (error && error.code !== '23505') { // ignore unique violation (already scheduled)
    console.warn('[supabaseSync] addScheduledWorkout error:', error.message);
    return false;
  }
  return true;
}

/** Remove a workout from a specific day in the user's schedule */
export async function removeScheduledWorkout(
  userId: string,
  workoutId: string,
  scheduledDay: string
): Promise<boolean> {
  const { error } = await supabase
    .from('scheduled_workouts')
    .delete()
    .eq('user_id', userId)
    .eq('workout_id', workoutId)
    .eq('scheduled_day', scheduledDay);

  if (error) {
    console.warn('[supabaseSync] removeScheduledWorkout error:', error.message);
    return false;
  }
  return true;
}

/** Subscribe to real-time changes on scheduled_workouts for a user */
export function subscribeToSchedule(
  userId: string,
  onChange: (rows: ScheduledWorkoutRow[]) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`schedule:${userId}:${Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scheduled_workouts',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const latest = await fetchSchedule(userId);
        onChange(latest);
      }
    )
    .subscribe();

  return channel;
}

// ─────────────────────────────────────────────────────────────────
// USER PROGRESS (Aggregate stats)
// ─────────────────────────────────────────────────────────────────

export interface UserProgressRow {
  user_id: string;
  total_calories: number;
  workouts_completed: number;
  average_accuracy: number;
  current_streak: number;
  last_workout_date: string | null;
  total_reps?: number;
  total_sets?: number;
  total_duration?: number;
}

/** Fetch user progress aggregates */
export async function fetchUserProgress(userId: string): Promise<UserProgressRow | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // ignore row not found error
    console.warn('[supabaseSync] fetchUserProgress error:', error.message);
    return null;
  }
  return data ?? null;
}

/** Subscribe to real-time changes on user_progress for a user */
export function subscribeToUserProgress(
  userId: string,
  onChange: (progress: UserProgressRow | null) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`user_progress:${userId}:${Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const latest = await fetchUserProgress(userId);
        onChange(latest);
      }
    )
    .subscribe();

  return channel;
}
