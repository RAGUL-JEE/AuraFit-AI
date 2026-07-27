/**
 * useWorkoutHistory.ts (Mobile App)
 *
 * Reads and writes to the shared `workout_sessions` table — the same table
 * used by the Web App. Realtime subscription ensures workout history
 * is in sync across both platforms without manual refresh.
 */
import { useEffect } from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  fetchWorkoutSessions,
  saveWorkoutSession,
  subscribeToWorkoutSessions,
  WorkoutSessionRow,
} from '../lib/supabaseSync';
import NetInfo from '@react-native-community/netinfo';

export type PendingMutation = {
  id: string;
  action: 'insert' | 'update' | 'delete';
  payload: any;
  timestamp: number;
};

/** Map a Supabase workout_sessions row → app WorkoutSession type */
function mapRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    exerciseId: row.exercise_id || '',
    reps: row.reps ?? 0,
    sets: row.sets ?? 0,
    calories: row.calories ?? 0,
    durationSeconds: row.duration_seconds ?? 0,
    accuracy: row.accuracy ?? 0,
    date: row.created_at || new Date().toISOString(),
  };
}

interface WorkoutStore {
  history: WorkoutSession[];
  pendingMutations: PendingMutation[];
  historyChannel: any;
  init: (userId: string) => void;
  cleanup: () => void;
  setHistory: (history: WorkoutSession[]) => void;
  loadCache: () => Promise<void>;
  addMutation: (mutation: PendingMutation) => void;
  removeMutation: (id: string) => void;
  syncMutations: (userId: string) => Promise<void>;
  optimisticSave: (session: WorkoutSession) => void;
  optimisticDelete: (id: string) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  history: [],
  pendingMutations: [],
  historyChannel: null,

  setHistory: (history) => {
    set({ history });
    AsyncStorage.setItem('workout_history', JSON.stringify(history)).catch(() => {});
  },

  loadCache: async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('workout_history');
      if (storedHistory) set({ history: JSON.parse(storedHistory) });

      const storedMutations = await AsyncStorage.getItem('pending_mutations');
      if (storedMutations) set({ pendingMutations: JSON.parse(storedMutations) });
    } catch {}
  },

  addMutation: (mutation) => {
    const next = [...get().pendingMutations, mutation];
    set({ pendingMutations: next });
    AsyncStorage.setItem('pending_mutations', JSON.stringify(next)).catch(() => {});
  },

  removeMutation: (id) => {
    const next = get().pendingMutations.filter(m => m.id !== id);
    set({ pendingMutations: next });
    AsyncStorage.setItem('pending_mutations', JSON.stringify(next)).catch(() => {});
  },

  optimisticSave: (session) => {
    const history = get().history;
    const existingIdx = history.findIndex(h => h.id === session.id);
    let next;
    if (existingIdx >= 0) {
      next = [...history];
      next[existingIdx] = session;
    } else {
      next = [session, ...history];
    }
    get().setHistory(next);
  },

  optimisticDelete: (id) => {
    const next = get().history.filter(h => h.id !== id);
    get().setHistory(next);
  },

  syncMutations: async (userId: string) => {
    const mutations = get().pendingMutations;
    const netState = await NetInfo.fetch();
    
    if (mutations.length === 0 || !netState.isConnected) return;

    for (const mutation of mutations) {
      try {
        if (mutation.action === 'insert' || mutation.action === 'update') {
          await saveWorkoutSession(userId, mutation.payload);
        } else if (mutation.action === 'delete') {
          const { error } = await supabase.from('workout_sessions').delete().eq('id', mutation.payload.id).eq('user_id', userId);
          if (error) throw error;
        }
        get().removeMutation(mutation.id);
      } catch (err) {
        console.warn('Failed to sync mutation', mutation.id, err);
        break; // Stop syncing if network drops
      }
    }
  },

  init: async (userId: string) => {
    get().cleanup();
    
    try {
      const rows = await fetchWorkoutSessions(userId);
      get().setHistory(rows.map(mapRow));
    } catch (err) {
      console.warn('[useWorkoutStore] Supabase load failed:', err);
    }

    const historyChannel = subscribeToWorkoutSessions(userId, (rows) => {
      get().setHistory(rows.map(mapRow));
    });

    set({ historyChannel });
  },

  cleanup: () => {
    const { historyChannel } = get();
    if (historyChannel) historyChannel.unsubscribe();
    set({ historyChannel: null, history: [] });
  }
}));

export function useWorkoutHistory() {
  const store = useWorkoutStore();
  const { history } = store;

  useEffect(() => {
    store.loadCache();

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        store.init(session.user.id);
        store.syncMutations(session.user.id);
      }
    };
    setup();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) store.syncMutations(session.user.id);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        store.init(session.user.id);
        store.syncMutations(session.user.id);
      } else {
        store.cleanup();
      }
    });

    return () => {
      unsubscribeNetInfo();
      subscription.unsubscribe();
      store.cleanup();
    };
  }, []);

  const syncOperation = async (action: 'insert' | 'update' | 'delete', payload: any, optimisticSession?: WorkoutSession, id?: string) => {
    // 1. Optimistic update
    if (action === 'insert' || action === 'update') {
      if (optimisticSession) store.optimisticSave(optimisticSession);
    } else if (action === 'delete') {
      if (id) store.optimisticDelete(id);
    }

    // 2. Add to offline queue
    const mutationId = Math.random().toString(36).substring(7);
    store.addMutation({
      id: mutationId,
      action,
      payload,
      timestamp: Date.now()
    });

    // 3. Try to sync immediately
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      store.syncMutations(session.user.id);
    }
  };

  const addSession = async (session: Omit<WorkoutSession, 'id' | 'date'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
    };

    const next = [newSession, ...history];
    store.setHistory(next);

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.user) {
        await saveWorkoutSession(authSession.user.id, {
          exercise_id: session.exerciseId,
          workout_name: session.exerciseId,
          exercise_name: session.exerciseId,
          reps: session.reps,
          sets: session.sets,
          calories: session.calories,
          duration: session.durationSeconds,
          duration_seconds: session.durationSeconds,
          accuracy: session.accuracy,
          correct_reps: session.reps,
          incorrect_reps: 0,
          status: 'completed'
        });
      }
    } catch (err) {
      console.warn('[useWorkoutHistory] Supabase write failed:', err);
    }
  };

  const totalWorkouts = history.length;
  const totalCalories = history.reduce((sum, s) => sum + s.calories, 0);
  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((sum, s) => sum + s.accuracy, 0) / history.length)
      : 0;

  const getStreak = () => {
    if (history.length === 0) return 0;
    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let foundTodayOrYesterday = false;
    const uniqueDays = Array.from(
      new Set(
        sorted.map(s => {
          const d = new Date(s.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      )
    );
    for (let i = 0; i < uniqueDays.length; i++) {
      const d = new Date(uniqueDays[i]);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (currentDate.getTime() - d.getTime()) / (1000 * 3600 * 24)
      );
      if (i === 0 && diffDays <= 1) {
        streak++;
        foundTodayOrYesterday = true;
      } else if (i > 0 && foundTodayOrYesterday) {
        const prevD = new Date(uniqueDays[i - 1]);
        prevD.setHours(0, 0, 0, 0);
        const gap = Math.floor(
          (prevD.getTime() - d.getTime()) / (1000 * 3600 * 24)
        );
        if (gap === 1) streak++;
        else break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  return { 
    history, 
    addSession, 
    syncOperation,
    totalWorkouts, 
    totalCalories, 
    streak, 
    avgAccuracy 
  };
}
