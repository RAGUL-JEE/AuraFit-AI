import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/Login';
import { Workouts } from './pages/Workouts';
import { Progress } from './pages/Progress';
import { Favorites } from './pages/Favorites';
import { Schedule } from './pages/Schedule';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';
import { Tab, ExerciseData } from './types';
import { useDarkMode } from './hooks/useDarkMode';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  useDarkMode(); // Initialize dark mode
  const { session, isCheckingSession, logout } = useAuth();
  const isLoggedIn = !!session;

  const [history, setHistory] = useState<(Tab | 'active-workout')[]>(['home']);
  const [activeExercise, setActiveExercise] = useState<ExerciseData | null>(null);

  const currentTab = history[history.length - 1];

  const handleTabChange = (tab: Tab | 'active-workout') => {
    if (tab === currentTab) return;
    setHistory(prev => [...prev, tab]);
  };

  const handleBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => {}} />;
  }

  const handleLaunchActivity = (ex?: ExerciseData) => {
    if (ex) {
      setActiveExercise(ex);
    }
    handleTabChange('active-workout');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onNavigate={handleTabChange} />;
      case 'workouts':
        return <Workouts onLaunchActivity={handleLaunchActivity} />;
      case 'how-it-works':
        return <HowItWorks onNavigate={handleTabChange} />;
      case 'favorites':
        return <Favorites onLaunchActivity={handleLaunchActivity} />;
      case 'progress':
        return <Progress />;
      case 'schedule':
        return <Schedule onLaunchActivity={handleLaunchActivity} />;
      case 'active-workout':
      case 'ai-detection':
        return <ActiveWorkout exercise={activeExercise} onExerciseChange={setActiveExercise} />;
      case 'settings':
        return <Settings onNavigate={handleTabChange} />;
      case 'profile':
        return <Profile />;
      default:
        return <div className="text-center py-20 text-on-surface-variant">Selected: {currentTab}</div>;
    }
  };

  // When inside active workout, we highlight the AI Detection tab on the sidebar to match the mockup
  const activeTabForLayout = currentTab === 'active-workout' ? 'ai-detection' : currentTab;

  return (
    <Layout 
      currentTab={activeTabForLayout} 
      onTabChange={handleTabChange} 
      onBack={handleBack}
      canGoBack={history.length > 1}
      onLogout={handleLogout}
      hideSidebarAndTopbar={false}
      title={(currentTab === 'active-workout' || currentTab === 'ai-detection') ? (activeExercise?.title || 'Bench Press') : undefined}
    >
      <div className="h-full flex flex-col">
        {renderContent()}
      </div>
    </Layout>
  );
}
