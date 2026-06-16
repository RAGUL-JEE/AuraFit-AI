export interface ExerciseData {
  id: string;
  title: string;
  muscle: string;
  image: string;
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  reps: number;
  sets: number;
  calories: number;
  durationSeconds: number;
  accuracy: number;
  date: string;
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  location: string;
  age: number;
  weight: number;
  height: number;
  bodyFat: number;
  fitnessGoal: string;
  bio: string;
  joinedDate: string;
  avatarUrl: string;
  cameraEnabled: boolean;
  audioFeedback: boolean;
  darkMode: boolean;
  notifications: boolean;
  dataSync: boolean;
  aiSensitivity: string;
  stats: {
    caloriesBurned: number;
    workoutsDone: number;
    avgAccuracy: number;
    dayStreak: number;
  };
}
