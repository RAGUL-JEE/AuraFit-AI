import { PerformanceStats } from './performanceAnalytics';
import { EXERCISES } from '../data/exercises';
import { ExerciseData } from '../types';

export interface AiSuggestion {
  advice: string;
  suggestedExercises: {
    exercise: ExerciseData;
    sets: number;
    reps: number;
    rest: string;
    level: string;
  }[];
}

export function getAiCoachAdvice(stats: PerformanceStats): AiSuggestion {
  if (stats.totalWorkouts === 0) {
    return {
      advice: "Welcome! Complete your first workout to get personalized AI insights.",
      suggestedExercises: [
        { exercise: EXERCISES[0], sets: 3, reps: 10, rest: '60s', level: 'Beginner' }
      ]
    };
  }

  // 1. Check consistency (Streak)
  if (stats.workoutFrequency.currentStreak >= 7) {
    return {
      advice: "Amazing consistency! You've been working out for 7+ days straight. Consider taking an active recovery day to reduce fatigue while maintaining progress.",
      suggestedExercises: [
        { exercise: EXERCISES.find(e => e.id === 'ex-03') || EXERCISES[0], sets: 2, reps: 15, rest: '30s', level: 'Recovery' } // Lunges or bodyweight
      ]
    };
  }

  // 2. Check neglected muscles
  const musclePercents = Object.fromEntries(
    stats.muscleDistribution.map(d => [d.label, d.percentage])
  );
  
  const upper = musclePercents['Upper Body'] || 0;
  const lower = musclePercents['Lower Body'] || 0;
  const core = musclePercents['Core'] || 0;

  if (upper > 70 && lower < 20) {
    return {
      advice: "Your workouts focus heavily on upper body training. Add more squats, lunges and Romanian deadlifts to improve lower body strength and balance.",
      suggestedExercises: [
        { exercise: EXERCISES.find(e => e.id === 'ex-02') || EXERCISES[0], sets: 3, reps: 12, rest: '90s', level: 'Intermediate' }, // Squat
        { exercise: EXERCISES.find(e => e.id === 'ex-03') || EXERCISES[0], sets: 3, reps: 10, rest: '60s', level: 'Intermediate' }  // Lunge
      ]
    };
  }

  if (core === 0 && stats.totalWorkouts > 5) {
    return {
      advice: "Core training has been neglected recently. Add planks, mountain climbers or hanging leg raises to improve stability and posture.",
      suggestedExercises: [
        { exercise: EXERCISES.find(e => e.id === 'ex-05') || EXERCISES[0], sets: 3, reps: 1, rest: '45s', level: 'All Levels' } // Plank
      ]
    };
  }

  // 3. Check calorie trends (simplified comparison)
  // If today's calories are very low compared to average
  if (stats.calories.today > 0 && stats.calories.today < (stats.calories.total / stats.totalWorkouts) * 0.5) {
    return {
      advice: "Workout intensity has decreased recently. Increase workout duration or include compound exercises for better calorie expenditure.",
      suggestedExercises: [
        { exercise: EXERCISES.find(e => e.id === 'ex-02') || EXERCISES[0], sets: 4, reps: 15, rest: '90s', level: 'Advanced' }
      ]
    };
  }

  // Default: Progress improving
  return {
    advice: "Excellent progress! You maintain a balanced routine. Continue progressive overload by increasing reps or resistance gradually.",
    suggestedExercises: [
      { exercise: EXERCISES.find(e => e.title === stats.favoriteExercise) || EXERCISES[0], sets: 4, reps: 12, rest: '60s', level: 'Advanced' }
    ]
  };
}
