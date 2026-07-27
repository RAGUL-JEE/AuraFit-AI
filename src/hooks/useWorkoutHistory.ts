/**
 * useWorkoutHistory.ts (Web App)
 *
 * Reads and writes to the shared `workout_sessions` table — the same table
 * used by the Mobile App. Realtime subscription ensures workout history
 * is in sync across both platforms without a page refresh.
 * Also synchronizes with `user_progress` for aggregate statistics.
 */
import { useEffect } from 'react';
import { create } from 'zustand';
import { WorkoutSession } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchWorkoutSessions,
  subscribeToWorkoutSessions,
  WorkoutSessionRow,
  fetchUserProgress,
  subscribeToUserProgress,
  UserProgressRow
} from '../lib/supabaseSync';

/** Map a Supabase workout_sessions row → app WorkoutSession type */
function mapRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    reps: row.reps ?? 0,
    sets: row.sets ?? 0,
    calories: row.calories ?? 0,
    durationSeconds: row.duration_seconds ?? 0,
    accuracy: row.accuracy ?? 0,
    date: row.created_at,
  };
}

export type PendingMutation = {
  id: string;
  endpoint: string;
  payload: any;
  timestamp: number;
  optimisticId?: string;
};

interface WorkoutStore {
  history: WorkoutSession[];
  progress: UserProgressRow | null;
  pendingMutations: PendingMutation[];
  historyChannel: any;
  progressChannel: any;
  init: (userId: string) => void;
  cleanup: () => void;
  setHistory: (history: WorkoutSession[]) => void;
  setProgress: (progress: UserProgressRow | null) => void;
  addMutation: (mutation: PendingMutation) => void;
  removeMutation: (id: string) => void;
  syncMutations: (token: string) => Promise<void>;
  optimisticSave: (session: WorkoutSession) => void;
  optimisticDelete: (id: string) => void;
}

const getInitialHistory = () => {
  try {
    const stored = localStorage.getItem('workout_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getInitialProgress = () => {
  try {
    const stored = localStorage.getItem('user_progress');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialMutations = (): PendingMutation[] => {
  try {
    const stored = localStorage.getItem('pending_mutations');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  history: getInitialHistory(),
  progress: getInitialProgress(),
  pendingMutations: getInitialMutations(),
  historyChannel: null,
  progressChannel: null,

  setHistory: (history) => {
    set({ history });
    localStorage.setItem('workout_history', JSON.stringify(history));
  },
  
  setProgress: (progress) => {
    set({ progress });
    localStorage.setItem('user_progress', JSON.stringify(progress));
  },

  addMutation: (mutation) => {
    const next = [...get().pendingMutations, mutation];
    set({ pendingMutations: next });
    localStorage.setItem('pending_mutations', JSON.stringify(next));
  },

  removeMutation: (id) => {
    const next = get().pendingMutations.filter(m => m.id !== id);
    set({ pendingMutations: next });
    localStorage.setItem('pending_mutations', JSON.stringify(next));
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

  syncMutations: async (token) => {
    const mutations = get().pendingMutations;
    if (mutations.length === 0 || !navigator.onLine) return;

    for (const mutation of mutations) {
      try {
        const res = await fetch(mutation.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(mutation.payload)
        });
        if (res.ok) {
          get().removeMutation(mutation.id);
        }
      } catch (err) {
        console.warn('Failed to sync mutation', mutation.id, err);
        break; // Stop syncing if network drops
      }
    }
  },

  init: async (userId: string) => {
    // Prevent multiple subscriptions
    get().cleanup();

    // 1. Load History
    try {
      const rows = await fetchWorkoutSessions(userId);
      get().setHistory(rows.map(mapRow));
    } catch (err) {
      console.warn('[useWorkoutStore] History load failed:', err);
    }

    // Subscribe History
    const historyChannel = subscribeToWorkoutSessions(userId, (rows) => {
      get().setHistory(rows.map(mapRow));
    });

    // 2. Load Progress
    try {
      const prog = await fetchUserProgress(userId);
      get().setProgress(prog);
    } catch (err) {
      console.warn('[useWorkoutStore] Progress load failed:', err);
    }

    // Subscribe Progress
    const progressChannel = subscribeToUserProgress(userId, (prog) => {
      get().setProgress(prog);
    });

    set({ historyChannel, progressChannel });
  },

  cleanup: () => {
    const { historyChannel, progressChannel } = get();
    if (historyChannel) historyChannel.unsubscribe();
    if (progressChannel) progressChannel.unsubscribe();
    set({ historyChannel: null, progressChannel: null });
  }
}));

export function useWorkoutHistory() {
  const { session } = useAuth();
  const store = useWorkoutStore();

  useEffect(() => {
    const handleOnline = () => {
      if (session?.access_token) {
        store.syncMutations(session.access_token);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.user?.id) {
      store.init(session.user.id);
      store.syncMutations(session.access_token);
    } else {
      store.cleanup();
    }
    return () => store.cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const addSession = async (workout: Omit<WorkoutSession, 'id' | 'date'>) => {
    console.warn('addSession is deprecated. Use POST /api/save-workout instead.');
  };

  const syncOperation = async (endpoint: string, payload: any, optimisticData?: { action: 'save' | 'delete', session?: WorkoutSession, id?: string }) => {
    // 1. Optimistic update
    if (optimisticData) {
      if (optimisticData.action === 'save' && optimisticData.session) {
        store.optimisticSave(optimisticData.session);
      } else if (optimisticData.action === 'delete' && optimisticData.id) {
        store.optimisticDelete(optimisticData.id);
      }
    }

    // 2. Add to offline queue immediately
    const mutationId = crypto.randomUUID();
    store.addMutation({
      id: mutationId,
      endpoint,
      payload,
      timestamp: Date.now()
    });

    // 3. Try to sync immediately
    if (session?.access_token) {
      store.syncMutations(session.access_token);
    }
  };

  const deleteSession = async (id: string) => {
    await syncOperation('/api/delete-workout', { id }, { action: 'delete', id });
  };

  const updateSession = async (session: WorkoutSession) => {
    await syncOperation('/api/update-workout', session, { action: 'save', session });
  };

  const totalWorkouts = store.progress?.workouts_completed ?? 0;
  const totalCalories = store.progress?.total_calories ?? 0;
  const avgAccuracy = store.progress?.average_accuracy ?? 0;
  const streak = store.progress?.current_streak ?? 0;

  return {
    history: store.history,
    addSession,
    deleteSession,
    updateSession,
    totalWorkouts,
    totalCalories,
    streak,
    avgAccuracy,
  };
}
