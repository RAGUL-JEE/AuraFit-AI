import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Clock, Download, Trash2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import GlobalHeader from '../components/GlobalHeader';
import TouchScale from '../components/animations/TouchScale';
import { useFavorites } from '../hooks/useFavorites';
import { WORKOUTS } from '../data/workouts';

export default function FavoritesScreen({ navigation }: any) {
  const { favorites, toggleFavorite } = useFavorites();

  const favoriteWorkouts = WORKOUTS.filter(w => favorites.includes(w.id));

  const startWorkout = (workoutId: string) => {
    navigation.navigate('Active', { workoutId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="Favorite Workouts" subtitle="Refine your peak performance with curated routines." />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {favoriteWorkouts.length === 0 ? (
          <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.emptyState}
          >
            <Heart size={48} color="#cbd5e1" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyDesc}>Explore workouts and tap the heart icon to build your custom collection of routines.</Text>
          </MotiView>
        ) : (
          <View style={styles.grid}>
            {favoriteWorkouts.map((workout, index) => (
              <MotiView
                key={workout.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100 }}
                style={styles.card}
              >
                <View style={styles.imageContainer}>
                  <Image source={workout.imageSource} style={styles.image} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{workout.muscle}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.heartButton}
                    onPress={() => toggleFavorite(workout.id)}
                  >
                    <Heart size={16} color="#ef4444" fill="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <View style={styles.formRow}>
                    <Clock size={14} color="#64748B" />
                    <Text style={styles.formText}>Recommended Form</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchScale 
                      style={styles.launchButton}
                      onPress={() => startWorkout(workout.id)}
                    >
                      <Text style={styles.launchText}>Launch Detection</Text>
                    </TouchScale>

                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => toggleFavorite(workout.id)}
                    >
                      <Trash2 size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </MotiView>
            ))}
          </View>
        )}

        <View style={styles.statsPanel}>
          <Text style={styles.statsTitle}>Favorite Statistics</Text>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Workouts Saved</Text>
            <Text style={styles.statValue}>{favorites.length}</Text>
          </View>

          <View style={styles.distributionContainer}>
            <Text style={styles.distributionTitle}>Muscle Focus Distribution</Text>
            {[
              { label: 'Chest & Arms', val: '45%' },
              { label: 'Lower Body', val: '30%' },
              { label: 'Core', val: '25%' }
            ].map(m => (
              <View key={m.label} style={styles.distributionRow}>
                <View style={styles.distributionHeader}>
                  <Text style={styles.distLabel}>{m.label}</Text>
                  <Text style={styles.distValue}>{m.val}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: m.val as any }]} />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.exportButton}>
            <Download size={16} color="#0f172a" />
            <Text style={styles.exportText}>Export Routine Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aiAdviceCard}>
          <View style={styles.aiHeader}>
            <View style={styles.pulsingDot} />
            <Text style={styles.aiTitle}>Coach AI Advice</Text>
          </View>
          <Text style={styles.aiDesc}>
            "Your favorite workouts lean heavily on upper body pushing. To maintain skeletal balance, I recommend adding more posterior chain exercises to your saved list."
          </Text>
          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>View Suggestions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 24,
    marginBottom: 24,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },
  grid: { marginBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  imageContainer: { height: 160, position: 'relative', backgroundColor: '#1e293b' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { padding: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  formRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 6 },
  formText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  launchButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  launchText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  deleteButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsPanel: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statsTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 24 },
  statBox: {
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  statValue: { fontSize: 40, fontWeight: 'bold', color: '#0f172a' },
  distributionContainer: { marginBottom: 24 },
  distributionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  distributionRow: { marginBottom: 16 },
  distributionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  distLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  distValue: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  progressBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 3 },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  exportText: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  aiAdviceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#60a5fa' },
  aiTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  aiDesc: { fontSize: 14, color: '#e2e8f0', lineHeight: 22, fontWeight: '500', marginBottom: 20 },
  aiButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  aiButtonText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
});
