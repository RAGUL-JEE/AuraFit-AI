import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { Home, Dumbbell, Calendar, LineChart, BrainCircuit } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';

const TabItem = ({ route, isFocused, options, onPress, onLongPress }: any) => {
  const isCenter = route.name === 'Detection';
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
    opacity.value = withTiming(0.7, { duration: 150 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  let Icon: any = null;
  if (route.name === 'Home') Icon = Home;
  else if (route.name === 'Workouts') Icon = Dumbbell;
  else if (route.name === 'Schedule') Icon = Calendar;
  else if (route.name === 'Progress') Icon = LineChart;
  else if (route.name === 'Detection') Icon = BrainCircuit;

  if (isCenter) {
    return (
      <View style={styles.centerButtonWrapper}>
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.centerButtonContainer}
        >
          <Animated.View style={[styles.centerButton, animatedStyle]}>
            {Icon && <Icon color="#fff" size={28} />}
          </Animated.View>
        </Pressable>
      </View>
    );
  }

  const color = isFocused ? '#1F2A44' : '#94a3b8'; // Active dark navy, inactive gray
  
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <MotiView 
          animate={{ scale: isFocused ? 1.1 : 1 }} 
          transition={{ type: 'spring', damping: 15 }}
        >
          {Icon && <Icon color={color} size={24} />}
        </MotiView>
        <Text style={[styles.tabLabel, { color }]}>{label.toUpperCase()}</Text>
        
        <AnimatePresence>
          {isFocused && (
            <MotiView 
              from={{ opacity: 0, scale: 0, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0, translateY: 10 }}
              transition={{ type: 'spring' }}
              style={{
                position: 'absolute',
                bottom: -8,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#1F2A44',
              }}
            />
          )}
        </AnimatePresence>
      </Animated.View>
    </Pressable>
  );
};

export default function BottomNavigation({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 15 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.8,
  },
  centerButtonWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1F2A44',
    borderWidth: 5,
    borderColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1F2A44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }
});
