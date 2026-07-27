import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

export interface WeeklyActivity {
  label: string;
  h1: string;
  h2: string;
  active?: boolean;
}

export interface DashboardState {
  caloriesBurned: number;
  workoutsCompleted: number;
  averageAccuracy: number;
  dayStreak: number;
  fitnessRank: string;
  waterIntake: number;
  sleepAverage: number;
  weeklyActivity: WeeklyActivity[];
}

export interface DashboardContextType {
  dashboardData: DashboardState;
  updateDashboard: (newData: Partial<DashboardState>) => Promise<void>;
  refreshFromSupabase: () => Promise<void>;
  isLoading: boolean;
}

const defaultDashboardData: DashboardState = {
  caloriesBurned: 0,
  workoutsCompleted: 0,
  averageAccuracy: 0,
  dayStreak: 0,
  fitnessRank: 'Unranked',
  waterIntake: 0,
  sleepAverage: 0,
  weeklyActivity: [
    { label: 'Mon', h1: '30%', h2: '30%' },
    { label: 'Tue', h1: '50%', h2: '30%' },
    { label: 'Wed', h1: '40%', h2: '40%' },
    { label: 'Thu', h1: '60%', h2: '20%' },
    { label: 'Fri', h1: '50%', h2: '30%' },
    { label: 'Sat', h1: '40%', h2: '35%' },
    { label: 'Sun', h1: '25%', h2: '25%', active: true }
  ]
};

const DashboardContext = createContext<DashboardContextType>({
  dashboardData: defaultDashboardData,
  updateDashboard: async () => {},
  refreshFromSupabase: async () => {},
  isLoading: true,
});

/** Compute a day-streak from an array of ISO date strings */
function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates]
    .map(d => {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      return dt.getTime();
    })
    .sort((a, b) => b - a);
  const unique = Array.from(new Set(sorted));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let expected = today.getTime();
  for (const ts of unique) {
    if (ts === expected || ts === expected - 86400000) {
      streak++;
      expected = ts - 86400000;
    } else if (ts < expected - 86400000) {
      break;
    }
  }
  return streak;
}

/** Map total workouts to a rank label */
function computeRank(total: number): string {
  if (total >= 100) return 'Elite';
  if (total >= 50) return 'Advanced';
  if (total >= 20) return 'Intermediate';
  if (total >= 5) return 'Beginner';
  return 'Unranked';
}

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboardData, setDashboardData] = useState<DashboardState>(defaultDashboardData);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage first (instant), then sync from Supabase
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dashboard_metrics');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!(parsed.workoutsCompleted === 12 && parsed.caloriesBurned === 482)) {
            setDashboardData({ ...defaultDashboardData, ...parsed });
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    refreshFromSupabase();

    // Subscribe to Realtime to instantly update dashboard when a workout is saved on another device
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        channel = supabase.channel(`dashboard_sessions:${session.user.id}:${Math.random()}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'workout_sessions', filter: `user_id=eq.${session.user.id}` },
            () => {
              // Whenever a workout is saved anywhere, refresh the dashboard!
              refreshFromSupabase();
            }
          )
          .subscribe();
      }
    };
    
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Pull the user's real workout history from Supabase and recalculate
   * all dashboard metrics so they match the website perfectly.
   */
  const refreshFromSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('calories, accuracy, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error || !data || data.length === 0) return;

      const totalCalories = data.reduce((sum: number, r: any) => sum + (r.calories ?? 0), 0);
      const avgAccuracy = Math.round(
        data.reduce((sum: number, r: any) => sum + (r.accuracy ?? 0), 0) / data.length
      );
      const streak = computeStreak(data.map((r: any) => r.created_at));
      const rank = computeRank(data.length);

      const updated: DashboardState = {
        ...dashboardData,
        caloriesBurned: totalCalories,
        workoutsCompleted: data.length,
        averageAccuracy: avgAccuracy,
        dayStreak: streak,
        fitnessRank: rank,
      };

      setDashboardData(updated);
      await AsyncStorage.setItem('@dashboard_metrics', JSON.stringify(updated));
    } catch (err) {
      console.warn('Dashboard Supabase sync error:', err);
    }
  };

  const updateDashboard = async (newData: Partial<DashboardState>) => {
    const updated = { ...dashboardData, ...newData };
    setDashboardData(updated);
    try {
      await AsyncStorage.setItem('@dashboard_metrics', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save dashboard data', error);
    }
  };

  return (
    <DashboardContext.Provider value={{ dashboardData, updateDashboard, refreshFromSupabase, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
