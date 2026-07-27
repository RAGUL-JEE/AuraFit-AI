import { WorkoutSession, ExerciseData } from '../types';

export interface PerformanceStats {
  totalWorkouts: number;
  muscleDistribution: { label: string; val: string; percentage: number }[];
  favoriteExercise: string | null;
  strongestMuscleGroup: string | null;
  workoutFrequency: {
    daysThisWeek: number;
    daysThisMonth: number;
    currentStreak: number;
    longestStreak: number;
  };
  calories: {
    today: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  duration: {
    today: number;
    weekly: number;
    monthly: number;
    average: number;
  };
}

// Maps specific exercises to broad muscle groups
function getBroadMuscleGroup(muscleString: string): string {
  const m = muscleString.toLowerCase();
  if (m.includes('chest') || m.includes('tricep') || m.includes('shoulder')) return 'Upper Body';
  if (m.includes('quad') || m.includes('glute') || m.includes('hamstring') || m.includes('leg')) return 'Lower Body';
  if (m.includes('core') || m.includes('abs')) return 'Core';
  if (m.includes('back') || m.includes('bicep') || m.includes('lat')) return 'Back';
  return 'Full Body';
}

export function calculatePerformanceStats(
  history: WorkoutSession[],
  exercises: ExerciseData[]
): PerformanceStats {
  if (!history || history.length === 0) {
    return {
      totalWorkouts: 0,
      muscleDistribution: [],
      favoriteExercise: null,
      strongestMuscleGroup: null,
      workoutFrequency: { daysThisWeek: 0, daysThisMonth: 0, currentStreak: 0, longestStreak: 0 },
      calories: { today: 0, weekly: 0, monthly: 0, total: 0 },
      duration: { today: 0, weekly: 0, monthly: 0, average: 0 }
    };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Week logic (starts Monday)
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() + diffToMon);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let calToday = 0, calWeek = 0, calMonth = 0, calTotal = 0;
  let durToday = 0, durWeek = 0, durMonth = 0, durTotal = 0;

  const exerciseCounts: Record<string, number> = {};
  const muscleGroups: Record<string, number> = {}; // for distribution
  const muscleVolume: Record<string, number> = {}; // for strongest group
  const activeDaysThisWeek = new Set<string>();
  const activeDaysThisMonth = new Set<string>();

  history.forEach(session => {
    const d = new Date(session.date);
    const time = d.getTime();
    const dateStr = d.toISOString().split('T')[0];

    // Cals & Duration
    calTotal += session.calories;
    durTotal += session.durationSeconds;
    
    if (time >= startOfDay) {
      calToday += session.calories;
      durToday += session.durationSeconds;
    }
    if (time >= startOfWeek.getTime()) {
      calWeek += session.calories;
      durWeek += session.durationSeconds;
      activeDaysThisWeek.add(dateStr);
    }
    if (time >= startOfMonth) {
      calMonth += session.calories;
      durMonth += session.durationSeconds;
      activeDaysThisMonth.add(dateStr);
    }

    // Exercise Counts
    exerciseCounts[session.exerciseId] = (exerciseCounts[session.exerciseId] || 0) + 1;

    // Muscle Groups & Volume
    const exDef = exercises.find(e => e.id === session.exerciseId);
    const broadMuscle = exDef ? getBroadMuscleGroup(exDef.muscle) : 'Full Body';
    const volume = (session.sets || 0) * (session.reps || 0);
    
    muscleGroups[broadMuscle] = (muscleGroups[broadMuscle] || 0) + 1;
    muscleVolume[broadMuscle] = (muscleVolume[broadMuscle] || 0) + volume;
  });

  // Calculate streaks
  const sortedDates = Array.from(new Set(history.map(s => new Date(s.date).toISOString().split('T')[0]))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let foundTodayOrYesterday = false;

  for (let i = 0; i < sortedDates.length; i++) {
    const d = new Date(sortedDates[i]);
    d.setHours(0,0,0,0);
    const diff = Math.floor((startOfDay - d.getTime()) / (1000 * 3600 * 24));
    
    if (i === 0 && diff <= 1) {
      currentStreak = 1;
      tempStreak = 1;
      foundTodayOrYesterday = true;
    } else if (i > 0) {
      const prev = new Date(sortedDates[i-1]);
      prev.setHours(0,0,0,0);
      const gap = Math.floor((prev.getTime() - d.getTime()) / (1000 * 3600 * 24));
      
      if (gap === 1) {
        tempStreak++;
        if (foundTodayOrYesterday) currentStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }
  if (sortedDates.length === 1 && longestStreak === 0) longestStreak = 1;

  // Favorite exercise
  let favoriteExercise = null;
  let maxCount = 0;
  for (const [exId, count] of Object.entries(exerciseCounts)) {
    if (count > maxCount) {
      maxCount = count;
      const exDef = exercises.find(e => e.id === exId);
      favoriteExercise = exDef ? exDef.title : exId;
    }
  }

  // Strongest Muscle Group
  let strongestMuscleGroup = null;
  let maxVol = 0;
  for (const [muscle, vol] of Object.entries(muscleVolume)) {
    if (vol > maxVol) {
      maxVol = vol;
      strongestMuscleGroup = muscle;
    }
  }

  // Distribution
  const distribution = Object.entries(muscleGroups).map(([label, count]) => {
    return {
      label,
      val: `${Math.round((count / history.length) * 100)}%`,
      percentage: (count / history.length) * 100
    };
  }).sort((a, b) => b.percentage - a.percentage);

  return {
    totalWorkouts: history.length,
    muscleDistribution: distribution,
    favoriteExercise,
    strongestMuscleGroup,
    workoutFrequency: {
      daysThisWeek: activeDaysThisWeek.size,
      daysThisMonth: activeDaysThisMonth.size,
      currentStreak,
      longestStreak
    },
    calories: {
      today: calToday,
      weekly: calWeek,
      monthly: calMonth,
      total: calTotal
    },
    duration: {
      today: Math.round(durToday / 60),
      weekly: Math.round(durWeek / 60),
      monthly: Math.round(durMonth / 60),
      average: Math.round((durTotal / history.length) / 60)
    }
  };
}
