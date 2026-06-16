import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { DashboardProvider } from './src/context/DashboardContext';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

import HomeScreen from './src/screens/HomeScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import DetectionScreen from './src/screens/DetectionScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import LoginScreen from './src/screens/LoginScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HowItWorksScreen from './src/screens/HowItWorksScreen';
import SplashScreen from './src/screens/SplashScreen';

import BottomNavigation from './src/components/BottomNavigation';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Detection" component={DetectionScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DashboardProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="Active" component={ActiveWorkoutScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DashboardProvider>
    </SafeAreaProvider>
  );
}
