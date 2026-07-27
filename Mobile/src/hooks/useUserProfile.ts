import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

const defaultProfile: UserProfile = {
  fullName: 'Alex Mercer',
  username: '@alexmercer_fit',
  email: 'alex.mercer@example.com',
  phoneNumber: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  age: 28,
  weight: 78,
  height: 182,
  bodyFat: 14,
  fitnessGoal: 'Hypertrophy & Strength',
  bio: 'Dedicated athlete focusing on strength conditioning and explosive power. Training for regional decathlon qualifiers. Leveraging AI biomechanical analysis to perfect my snatch and clean & jerk forms. Always striving for 1% daily improvement.',
  joinedDate: 'Jan 2024',
  avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
  cameraEnabled: true,
  audioFeedback: true,
  darkMode: false,
  notifications: true,
  dataSync: true,
  aiSensitivity: 'High',
  stats: {
    caloriesBurned: 12480,
    workoutsDone: 42,
    avgAccuracy: 88.4,
    dayStreak: 15,
  }
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    let channel: any = null;

    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_profile');
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { subscribeToProfile } = await import('../lib/supabaseSync');
        channel = subscribeToProfile(session.user.id, (payload) => {
          setProfile(prev => {
            const mapped = {
              fullName: payload.full_name || prev.fullName,
              username: payload.username || prev.username,
              email: payload.email || prev.email,
              phoneNumber: payload.phone_number || prev.phoneNumber,
              location: payload.location || prev.location,
              age: payload.age ? Number(payload.age) : prev.age,
              weight: payload.weight ? Number(payload.weight) : prev.weight,
              height: payload.height ? Number(payload.height) : prev.height,
              bodyFat: payload.body_fat ? Number(payload.body_fat) : prev.bodyFat,
              fitnessGoal: payload.fitness_goal || prev.fitnessGoal,
              bio: payload.bio || prev.bio,
              avatarUrl: payload.avatar_url || prev.avatarUrl,
              joinedDate: payload.joined_date || prev.joinedDate,
              cameraEnabled: payload.camera_enabled ?? prev.cameraEnabled,
              audioFeedback: payload.audio_feedback ?? prev.audioFeedback,
              darkMode: payload.dark_mode ?? prev.darkMode,
              notifications: payload.notifications ?? prev.notifications,
              dataSync: payload.data_sync ?? prev.dataSync,
              aiSensitivity: payload.ai_sensitivity || prev.aiSensitivity,
            };
            const updated = { ...prev, ...mapped };
            AsyncStorage.setItem('user_profile', JSON.stringify(updated)).catch(()=>{});
            return updated;
          });
        });
      }
    };
    loadProfile();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    let updated: UserProfile = { ...profile, ...newProfile };
    setProfile(updated);
    
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save profile to async storage', e);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const supabaseData = {
          id: session.user.id,
          full_name: newProfile.fullName,
          username: newProfile.username,
          email: newProfile.email || session.user.email,
          phone_number: newProfile.phoneNumber,
          location: newProfile.location,
          age: newProfile.age,
          weight: newProfile.weight,
          height: newProfile.height,
          body_fat: newProfile.bodyFat,
          fitness_goal: newProfile.fitnessGoal,
          bio: newProfile.bio,
          avatar_url: newProfile.avatarUrl,
          joined_date: newProfile.joinedDate,
          camera_enabled: newProfile.cameraEnabled,
          audio_feedback: newProfile.audioFeedback,
          dark_mode: newProfile.darkMode,
          notifications: newProfile.notifications,
          data_sync: newProfile.dataSync,
          ai_sensitivity: newProfile.aiSensitivity,
          updated_at: new Date().toISOString()
        };

        const filteredData = Object.fromEntries(
          Object.entries(supabaseData).filter(([_, v]) => v !== undefined && v !== null)
        );

        if (Object.keys(filteredData).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .upsert(filteredData, { onConflict: 'id' });
          
          if (error) {
            console.error('Supabase profile upsert sync failed:', error.message);
          }
        }
      }
    } catch (err) {
      console.error('Database connection profile update error:', err);
    }
  };

  return { profile, updateProfile };
}
