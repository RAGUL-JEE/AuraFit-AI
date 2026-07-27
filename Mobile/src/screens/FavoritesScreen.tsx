import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Clock, Download, Trash2, Flame, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import GlobalHeader from '../components/GlobalHeader';
import TouchScale from '../components/animations/TouchScale';
import { useFavorites } from '../hooks/useFavorites';
import { useWorkoutStore } from '../hooks/useWorkoutHistory';
import { WORKOUTS } from '../data/workouts';
import { EXERCISES } from '../data/exercises';
import { calculatePerformanceStats } from '../lib/performanceAnalytics';
import { getAiCoachAdvice } from '../lib/aiCoach';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function FavoritesScreen({ navigation }: any) {
  const { favorites, toggleFavorite } = useFavorites();
  const { history } = useWorkoutStore();
  const [showAiModal, setShowAiModal] = useState(false);

  const favoriteWorkouts = WORKOUTS.filter(w => favorites.includes(w.id));

  const stats = useMemo(() => calculatePerformanceStats(history, EXERCISES), [history]);
  const aiCoach = useMemo(() => getAiCoachAdvice(stats), [stats]);

  const startWorkout = (workoutId: string) => {
    navigation.navigate('Active', { workoutId });
  };

  const handleExport = async () => {
    try {
      let csv = 'Date,Exercise ID,Sets,Reps,Duration (s),Calories,Accuracy\n';
      history.forEach(s => {
        csv += `${new Date(s.date).toISOString()},${s.exerciseId},${s.sets},${s.reps},${s.durationSeconds},${s.calories},${s.accuracy}\n`;
      });
      
      const fileUri = FileSystem.documentDirectory + `workout_routine_export_${new Date().toISOString().split('T')[0]}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (err) {
      console.warn("Export failed:", err);
    }
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
          <Text style={styles.statsTitle}>Performance Statistics</Text>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Workouts Saved</Text>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          </View>

          <View style={styles.distributionContainer}>
            <Text style={styles.distributionTitle}>Muscle Focus Distribution</Text>
            {stats.muscleDistribution.length > 0 ? (
              stats.muscleDistribution.slice(0, 4).map(m => (
                <View key={m.label} style={styles.distributionRow}>
                  <View style={styles.distributionHeader}>
                    <Text style={styles.distLabel}>{m.label}</Text>
                    <Text style={styles.distValue}>{m.val}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: m.val as any }]} />
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#64748B' }}>No data to display yet.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
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
            "{aiCoach.advice}"
          </Text>
          <TouchableOpacity style={styles.aiButton} onPress={() => setShowAiModal(true)}>
            <Text style={styles.aiButtonText}>View Suggestions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Suggestion Modal */}
      <Modal
        visible={showAiModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Flame size={24} color="#ef4444" />
                <Text style={styles.modalTitle}>AI Routine</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAiModal(false)} style={styles.closeButton}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalAdviceText}>{aiCoach.advice}</Text>
              
              <View style={styles.suggestionsContainer}>
                {aiCoach.suggestedExercises.map((s, idx) => (
                  <View key={idx} style={styles.suggestionCard}>
                    <View style={styles.suggestionImageContainer}>
                      {/* Note: since exercise images in data might be local requires or remote, 
                          we handle standard URI if it's a web path, but for local requires we might need a mapping.
                          Assuming they are remote strings or local requires depending on data mapping. */}
                      <Image 
                        source={typeof s.exercise.image === 'string' ? { uri: `http://localhost:5173${s.exercise.image}` } : s.exercise.image} 
                        style={styles.suggestionImage} 
                        defaultSource={require('../../assets/icon.png')}
                      />
                    </View>
                    <View style={styles.suggestionDetails}>
                      <View style={styles.suggestionHeaderRow}>
                        <Text style={styles.suggestionTitle}>{s.exercise.title}</Text>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>{s.level}</Text>
                        </View>
                      </View>
                      <Text style={styles.suggestionMuscle}>{s.exercise.muscle}</Text>
                      <View style={styles.suggestionMetricsRow}>
                        <View style={styles.metricBadge}><Text style={styles.metricBadgeText}>{s.sets} Sets</Text></View>
                        <View style={styles.metricBadge}><Text style={styles.metricBadgeText}>{s.reps} Reps</Text></View>
                        <View style={styles.metricBadge}><Text style={styles.metricBadgeText}>{s.rest} Rest</Text></View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.gotItButton} onPress={() => setShowAiModal(false)}>
                <Text style={styles.gotItText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  aiDesc: { fontSize: 14, color: '#e2e8f0', lineHeight: 22, fontWeight: '500', marginBottom: 20, minHeight: 60 },
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
  
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: 20 },
  modalAdviceText: { fontSize: 14, fontWeight: '500', color: '#64748B', marginBottom: 20, lineHeight: 22 },
  suggestionsContainer: { gap: 16, paddingBottom: 20 },
  suggestionCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    backgroundColor: '#fff',
  },
  suggestionImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  suggestionImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  suggestionDetails: { flex: 1, justifyContent: 'center' },
  suggestionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  suggestionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', flex: 1 },
  levelBadge: { backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase' },
  suggestionMuscle: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  suggestionMetricsRow: { flexDirection: 'row', gap: 8 },
  metricBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metricBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gotItButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  gotItText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
