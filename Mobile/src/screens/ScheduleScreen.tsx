import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Bell, Plus, Calendar, ChevronRight, X } from 'lucide-react-native';
import GlobalHeader from '../components/GlobalHeader';
import TouchScale from '../components/animations/TouchScale';
import { MotiView, AnimatePresence } from 'moti';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AVAILABLE_WORKOUTS = [
  { id: 'pushup', title: 'Push-Up', muscle: 'Chest & Triceps', imageSource: require('../../../public/images/workouts/push_up_cyber.png') },
  { id: 'squat', title: 'Squat', muscle: 'Quadriceps & Glutes', imageSource: require('../../../public/images/workouts/squat_cyber.png') },
  { id: 'lunge', title: 'Lunge', muscle: 'Quadriceps & Hamstrings', imageSource: require('../../../public/images/workouts/lunge_cyber.png') },
  { id: 'plank', title: 'Plank', muscle: 'Core', imageSource: require('../../../public/images/workouts/plank_cyber.png') },
  { id: 'bicep', title: 'Bicep Curl', muscle: 'Biceps', imageSource: require('../../../public/images/workouts/bicep_curl_cyber.png') },
  { id: 'shoulderpress', title: 'Shoulder Press', muscle: 'Shoulders', imageSource: require('../../../public/images/workouts/shoulder_press_cyber.png') },
  { id: 'benchpress', title: 'Bench Press', muscle: 'Chest', imageSource: require('../../../public/images/workouts/bench_press_cyber.png') },
  { id: 'latpulldown', title: 'Lat Pulldown', muscle: 'Lats & Back', imageSource: require('../../../public/images/workouts/lat_pulldown_cyber.png') },
  { id: 'deadlift', title: 'Deadlift', muscle: 'Posterior Chain', imageSource: require('../../../public/images/workouts/deadlift_cyber.png') },
  { id: 'mountainclimber', title: 'Mountain Climber', muscle: 'Core & Cardio', imageSource: require('../../../public/images/workouts/mountain_climber_cyber.png') },
];

type Workout = typeof AVAILABLE_WORKOUTS[0];

export default function ScheduleScreen() {
  const [activeDay, setActiveDay] = useState('Mon');
  const [scheduledWorkouts, setScheduledWorkouts] = useState<Record<string, Workout[]>>({});
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dayToSchedule, setDayToSchedule] = useState<string | null>(null);

  const openModalForDay = (fullDay: string) => {
    setDayToSchedule(fullDay);
    setIsModalVisible(true);
  };

  const openModalForActiveDay = () => {
    const fullDayIndex = DAYS_SHORT.indexOf(activeDay);
    if (fullDayIndex !== -1) {
      openModalForDay(DAYS_FULL[fullDayIndex]);
    }
  };

  const handleAddWorkout = (workout: Workout) => {
    if (!dayToSchedule) return;
    
    setScheduledWorkouts(prev => ({
      ...prev,
      [dayToSchedule]: [...(prev[dayToSchedule] || []), workout]
    }));
    
    setIsModalVisible(false);
  };

  const handleRemoveWorkout = (fullDay: string, indexToRemove: number) => {
    setScheduledWorkouts(prev => ({
      ...prev,
      [fullDay]: (prev[fullDay] || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="Workout Schedule" />
      <View style={{ paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#f8fafc' }}>
        <Text style={styles.headerSubtitle}>Plan your week for maximum consistency</Text>
      </View>

      {/* Horizontal Days Selector */}
      <View style={styles.horizontalScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          {DAYS_SHORT.map((day, idx) => {
            const isActive = activeDay === day;
            const fullDay = DAYS_FULL[idx];
            const workoutCount = scheduledWorkouts[fullDay]?.length || 0;
            
            return (
              <TouchScale 
                key={day} 
                style={[styles.dayCard, isActive && styles.dayCardActive]}
                onPress={() => setActiveDay(day)}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
                <View style={[styles.countPill, isActive && styles.countPillActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>{workoutCount}</Text>
                </View>
              </TouchScale>
            );
          })}
        </ScrollView>
      </View>

      {/* Vertical Schedule List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scheduleList}>
        {DAYS_FULL.map((fullDay) => {
          const dayWorkouts = scheduledWorkouts[fullDay] || [];
          
          return (
            <MotiView 
              key={fullDay} 
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: DAYS_FULL.indexOf(fullDay) * 100, type: 'timing', duration: 400 }}
              style={styles.scheduleRowContainer}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowDayText}>{fullDay}</Text>
                <View style={styles.rowCountPill}>
                  <Text style={styles.countText}>{dayWorkouts.length}</Text>
                </View>
              </View>
              
              <View style={styles.rowRight}>
                {dayWorkouts.length === 0 ? (
                  <TouchScale style={styles.addWorkoutDashed} onPress={() => openModalForDay(fullDay)}>
                    <Plus color="#94a3b8" size={16} />
                    <Text style={styles.addWorkoutText}>Add Workout</Text>
                  </TouchScale>
                ) : (
                  <View style={styles.workoutsContainer}>
                    <AnimatePresence>
                      {dayWorkouts.map((w, idx) => (
                        <MotiView 
                          key={idx} 
                          from={{ opacity: 0, height: 0, scale: 0.9 }}
                          animate={{ opacity: 1, height: 60, scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.9 }}
                          style={styles.scheduledWorkoutCard}
                        >
                          <Image source={w.imageSource} style={styles.scheduledImage} />
                          <View style={styles.scheduledInfo}>
                            <Text style={styles.scheduledTitle}>{w.title}</Text>
                            <Text style={styles.scheduledMuscle}>{w.muscle}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeWorkoutBtn} 
                            onPress={() => handleRemoveWorkout(fullDay, idx)}
                          >
                            <X color="#ef4444" size={16} />
                          </TouchableOpacity>
                        </MotiView>
                      ))}
                    </AnimatePresence>
                    <TouchScale style={styles.addMoreBtn} onPress={() => openModalForDay(fullDay)}>
                      <Plus color="#8b5cf6" size={16} />
                      <Text style={styles.addMoreText}>Add Another Workout</Text>
                    </TouchScale>
                  </View>
                )}
              </View>
            </MotiView>
          );
        })}

        {/* Stay Consistent Card */}
        <View style={styles.consistentCard}>
          <View style={styles.consistentIconBox}>
            <Calendar color="#8b5cf6" size={20} />
          </View>
          <View style={styles.consistentTextWrap}>
            <Text style={styles.consistentTitle}>Stay Consistent</Text>
            <Text style={styles.consistentSubtitle}>Build your schedule and stay on track with your fitness goals!</Text>
          </View>
          <ChevronRight color="#94a3b8" size={20} />
        </View>
        
        <View style={{ height: 100 }} />
        {/* Spacer for FAB */}
      </ScrollView>

      {/* Floating Action Button */}
      <MotiView 
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 300, stiffness: 200 }}
        style={{ position: 'absolute', bottom: 24, alignSelf: 'center', zIndex: 10 }}
      >
        <TouchScale style={[styles.fab, { position: 'relative', bottom: 0, right: 0 }]} onPress={openModalForActiveDay}>
          <Plus color="#fff" size={24} style={{ marginBottom: 2 }} />
          <Text style={styles.fabText}>Add Workout</Text>
        </TouchScale>
      </MotiView>

      {/* Selection Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule for {dayToSchedule}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {AVAILABLE_WORKOUTS.map(w => (
                <TouchableOpacity key={w.id} style={styles.modalWorkoutRow} onPress={() => handleAddWorkout(w)}>
                  <Image source={w.imageSource} style={styles.modalImage} />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalWorkoutTitle}>{w.title}</Text>
                    <Text style={styles.modalWorkoutMuscle}>{w.muscle}</Text>
                  </View>
                  <View style={styles.modalAddBtn}>
                    <Plus color="#fff" size={16} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafb',
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
  menuButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  notificationBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#fafafb',
  },
  horizontalScrollWrapper: {
    marginBottom: 24,
  },
  daysScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayCard: {
    width: 60,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  dayCardActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  dayTextActive: {
    color: '#fff',
  },
  countPill: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countPillActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countText: {
    color: '#8b5cf6',
    fontSize: 11,
    fontWeight: '800',
  },
  countTextActive: {
    color: '#fff',
  },
  scheduleList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scheduleRowContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  rowLeft: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  rowDayText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginRight: 8,
  },
  rowCountPill: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rowRight: {
    flex: 1,
  },
  addWorkoutDashed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  addWorkoutText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  workoutsContainer: {
    gap: 12,
  },
  scheduledWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  scheduledImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  scheduledInfo: {
    marginLeft: 12,
    flex: 1,
  },
  scheduledTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  scheduledMuscle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  removeWorkoutBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
  },
  addMoreText: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  consistentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  consistentIconBox: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  consistentTextWrap: {
    flex: 1,
  },
  consistentTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  consistentSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    paddingRight: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  fabText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalWorkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  modalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  modalWorkoutTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalWorkoutMuscle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  modalAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
