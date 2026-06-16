import React from 'react';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';

export default function DetectionScreen({ navigation }: any) {
  return (
    <ActiveWorkoutScreen 
      navigation={navigation} 
      route={{ params: { workoutId: 'pushup' } }} 
    />
  );
}
