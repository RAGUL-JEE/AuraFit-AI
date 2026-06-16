import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Heart, SlidersHorizontal, Clock, ChevronRight } from 'lucide-react-native';
import Constants from 'expo-constants';
import GlobalHeader from '../components/GlobalHeader';
import TouchScale from '../components/animations/TouchScale';
import { MotiPressable } from 'moti/interactions';
import { AnimatePresence, MotiView } from 'moti';

const hostUri = Constants.expoConfig?.hostUri;
const localIp = hostUri ? hostUri.split(':')[0] : '192.168.1.100';
const imageBaseUrl = `http://${localIp}:5173`;

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

import { WORKOUTS } from '../data/workouts';

const FallbackImage = ({ source, style }: { source: any; style: any }) => {
  const [hasError, setHasError] = useState(false);
  const fallbackUrl = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80';
  return (
    <Image 
      source={hasError ? { uri: fallbackUrl } : source} 
      style={[style, { resizeMode: 'cover' }]}
      onError={() => setHasError(true)}
    />
  );
};

export default function WorkoutsScreen({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState('All');

  const startWorkout = (workoutId: string) => {
    navigation.navigate('Active', { workoutId });
  };

  const filteredWorkouts = WORKOUTS.filter(w => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Chest' && w.muscle.includes('Chest')) return true;
    if (activeCategory === 'Legs' && (w.muscle.includes('Quad') || w.muscle.includes('Posterior'))) return true;
    if (activeCategory === 'Arms' && (w.muscle.includes('Bicep') || w.muscle.includes('Shoulder'))) return true;
    if (activeCategory === 'Back' && w.muscle.includes('Back')) return true;
    if (activeCategory === 'Core' && w.muscle.includes('Core')) return true;
    return false;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="Workouts" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK 👋</Text>
            <Text style={styles.titleText}>AURAFIT AI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell color="#1e293b" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.pageTitle}>Choose Your Workout</Text>
        
        <TextInput 
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#94a3b8"
        />

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity 
              key={category} 
              style={[
                styles.categoryPill, 
                activeCategory === category && styles.categoryPillActive
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Workout Grid */}
        <View style={styles.gridContainer}>
          <AnimatePresence>
            {filteredWorkouts.map((workout, index) => (
              <MotiView 
                key={workout.id} 
                from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', delay: index * 100, damping: 20, stiffness: 100 }}
                style={styles.card}
              >
                
                <View style={styles.cardTopRow}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{workout.level}</Text>
                  </View>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>{workout.number}</Text>
                  </View>
                </View>

                <View style={styles.cardImageContainer}>
                  <FallbackImage source={workout.imageSource} style={styles.cardImage} />
                  <MotiPressable 
                    style={styles.favoriteBtn}
                    animate={({ pressed }) => {
                      'worklet';
                      return {
                        scale: pressed ? 1.4 : 1,
                      }
                    }}
                  >
                    <Heart color="#fff" size={16} />
                  </MotiPressable>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <Text style={styles.targetText}>{workout.muscle.toUpperCase()}</Text>

                  <TouchScale 
                    style={styles.startButton}
                    onPress={() => startWorkout(workout.id)}
                  >
                    <Text style={styles.startButtonText}>Launch Detection</Text>
                  </TouchScale>
                </View>
              </MotiView>
            ))}
          </AnimatePresence>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  welcomeText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  categoryText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#14b8a6',
    fontSize: 10,
    fontWeight: '800',
  },
  numberBadge: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  numberBadgeText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  cardImageContainer: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    paddingHorizontal: 2,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  targetText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  startButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
