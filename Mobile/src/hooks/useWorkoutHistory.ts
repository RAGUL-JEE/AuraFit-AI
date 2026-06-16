import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '../types';
import { supabase } from '../lib/supabaseClient';

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const loadedFromDB = useRef(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('workout_history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load history from storage', e);
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.warn('Supabase load failed', error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: WorkoutSession[] = data.map((row: any) => ({
            id: row.id,
            exerciseId: row.exercise_id,
            reps: row.reps ?? 0,
            sets: row.sets ?? 0,
            calories: row.calories ?? 0,
            durationSeconds: row.duration_seconds ?? 0,
            accuracy: row.accuracy ?? 0,
            date: row.created_at,
          }));
          setHistory(mapped);
          await AsyncStorage.setItem('workout_history', JSON.stringify(mapped));
        }
        loadedFromDB.current = true;
      } catch (err) {
        console.warn('Supabase sync error', err);
      }
    };

    loadHistory();
  }, []);

  const addSession = async (session: Omit<WorkoutSession, 'id' | 'date'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
    };

    const next = [newSession, ...history];
    setHistory(next);
    
    try {
      await AsyncStorage.setItem('workout_history', JSON.stringify(next));
    } catch (e) {}

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.user) {
        await supabase.from('workout_sessions').insert({
          user_id: authSession.user.id,
          exercise_id: session.exerciseId,
          reps: session.reps,
          sets: session.sets,
          calories: session.calories,
          duration_seconds: session.durationSeconds,
          accuracy: session.accuracy,
        });
      }
    } catch (err) {}
  };

  const totalWorkouts = history.length;
  const totalCalories = history.reduce((sum, s) => sum + s.calories, 0);
  const avgAccuracy = history.length > 0 
    ? Math.round(history.reduce((sum, s) => sum + s.accuracy, 0) / history.length) 
    : 0;

  const getStreak = () => {
    if (history.length === 0) return 0;
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let foundTodayOrYesterday = false;
    
    const uniqueDays = Array.from(new Set(sorted.map(s => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })));

    for (let i = 0; i < uniqueDays.length; i++) {
      const d = new Date(uniqueDays[i]);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
      
      if (i === 0 && diffDays <= 1) {
        streak++;
        foundTodayOrYesterday = true;
      } else if (i > 0 && foundTodayOrYesterday) {
        const prevD = new Date(uniqueDays[i - 1]);
        prevD.setHours(0, 0, 0, 0);
        const gap = Math.floor((prevD.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (gap === 1) streak++;
        else break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  return { history, addSession, totalWorkouts, totalCalories, streak, avgAccuracy };
}
