import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  isLoading: true,
});

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboardData, setDashboardData] = useState<DashboardState>(defaultDashboardData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dashboard_metrics');
        if (stored) {
          const parsed = JSON.parse(stored);
          // If it's the old mock data, ignore it and use 0s
          if (parsed.workoutsCompleted === 12 && parsed.caloriesBurned === 482) {
            setDashboardData(defaultDashboardData);
          } else {
            setDashboardData({ ...defaultDashboardData, ...parsed });
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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
    <DashboardContext.Provider value={{ dashboardData, updateDashboard, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
