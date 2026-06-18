import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Linking, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../components/GlobalHeader';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import TouchScale from '../components/animations/TouchScale';
import { useDashboard } from '../context/DashboardContext';
import { ArrowLeft, Search, BrainCircuit, AlertCircle, ExternalLink, Minus, Plus, ChevronUp, Play, Square, Save, PlayCircle, Activity, Video as VideoIcon } from 'lucide-react-native';
import { WORKOUT_DETAILS } from '../data/workoutDetails';
import { useVideoPlayer, VideoView } from 'expo-video';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';

const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0] || '192.168.1.5';
const BACKEND_URL = `http://${localIp}:5001`;
const { width, height } = Dimensions.get('window');

export default function ActiveWorkoutScreen({ route, navigation }: any) {
  const { workoutId } = route.params || { workoutId: 'pushup' };
  const details = WORKOUT_DETAILS[workoutId] || WORKOUT_DETAILS['pushup'];
  const { dashboardData, updateDashboard } = useDashboard();
  
  const videoBaseUrl = 'https://egeahlmqxbzqeiqsrobq.supabase.co/storage/v1/object/public/videos';
  const videoSource = details?.video?.localVideoName ? `${videoBaseUrl}/${details.video.localVideoName}` : null;
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
  });
  
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<'front' | 'back'>('front');
  const [isActive, setIsActive] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    reps: 0,
    targetReps: 15,
    calories: 0,
    time: 0,
    sets: 1,
    targetSets: 4,
    completed: false,
    accuracy: 0
  });

  const cameraRef = useRef<CameraView>(null);
  const frameInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    return () => {
      stopDetection();
      Speech.stop();
    };
  }, []);

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  };

  const startDetection = async () => {
    setIsActive(true);
    setProcessedImage(null);
    try {
      await fetch(`${BACKEND_URL}/api/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start',
          workout: workoutId,
          target: stats.targetReps,
          sets: stats.targetSets
        })
      });
    } catch (error) {
      console.log('Error starting backend:', error);
    }
    // Changed detection method: 10 FPS (100ms) for high-speed tracking
    frameInterval.current = setInterval(processFrame, 100);
  };

  const stopDetection = async () => {
    setIsActive(false);
    setProcessedImage(null);
    if (frameInterval.current) {
      clearInterval(frameInterval.current);
    }
    try {
      await fetch(`${BACKEND_URL}/api/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
    } catch (error) {
      console.log('Error stopping backend:', error);
    }
  };

  const processFrame = async () => {
    if (isProcessing.current || !cameraRef.current || !isActive) return;
    
    try {
      isProcessing.current = true;
      const picture = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.2 });
      
      if (picture?.base64) {
        const response = await fetch(`${BACKEND_URL}/api/mobile/process_frame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: picture.base64 })
        });
        
        const data = await response.json();
        if (data && !data.error) {
          setStats(prev => {
            const newReps = data.counter !== undefined ? parseInt(data.counter) : prev.reps;
            const newSets = data.set_str ? parseInt(data.set_str.split('/')[0]) : prev.sets;

            // AI Voice Feedback added to detection method
            if (newReps > prev.reps && newReps > 0) {
              speak(newReps.toString());
            }
            if (newSets > prev.sets) {
              speak(`Set ${newSets} completed`);
            }
            if (data.completed && !prev.completed) {
              speak(`Workout completed! Great job.`);
            }

            return {
              ...prev,
              reps: newReps,
              calories: data.calories ?? prev.calories,
              time: data.time_elapsed ?? prev.time,
              sets: newSets,
              completed: data.completed ?? false,
              accuracy: data.accuracy ?? prev.accuracy
            };
          });

          // Processed image from backend containing drawn skeleton
          if (data.processed_image_base64) {
            setProcessedImage(data.processed_image_base64);
          }
          
          if (data.completed) {
            stopDetection();
            Alert.alert("Workout Complete", "Great job!");
          }
        }
      }
    } catch (err) {
      console.log("Frame processing error:", err);
    } finally {
      isProcessing.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return <Text style={styles.permissionText}>No access to camera</Text>;

  const isReady = isActive && stats.accuracy > 90;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <GlobalHeader 
          title="Precision Coach" 
          subtitle="LAB-GRADE PERFORMANCE"
          rightContent={
            <>
              <Search color="#111" size={22} style={{ marginRight: 15 }} />
              <View style={styles.avatarPlaceholder} />
            </>
          }
        />

        {/* CAMERA AREA */}
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={type} ref={cameraRef} />
          {isActive && processedImage ? (
            <Image 
              source={{ uri: `data:image/jpeg;base64,${processedImage}` }} 
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}
          
          <View style={[styles.aiStandbyBadge, isActive && { backgroundColor: isReady ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }]}>
            <View style={[styles.yellowDot, isActive && { backgroundColor: '#fff' }]} />
            <Text style={[styles.aiStandbyText, isActive && { color: '#fff' }]}>
              {isActive ? (isReady ? 'READY' : 'ADJUST POSTURE') : 'AI STANDBY'}
            </Text>
          </View>
        </View>

        {/* HUD: AURA REAL-TIME ANALYSIS */}
        <View style={styles.hudCard}>
          <View style={styles.hudHeader}>
            <Text style={styles.hudTitle}>AURA REAL-TIME ANALYSIS</Text>
            <BrainCircuit color="#475569" size={22} />
          </View>
          
          <View style={styles.accuracyRow}>
            <Text style={styles.accuracyLabel}>Accuracy Score</Text>
            <AnimatedCounter value={stats.accuracy} suffix="%" duration={600} style={styles.accuracyValue} />
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${stats.accuracy}%` }]} />
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.repCard]}>
              <View style={styles.badgeTopRight}><Text style={[styles.badgeText, {color:'#7c3aed'}]}>SJ</Text></View>
              <Text style={[styles.statCardLabel, {color:'#8b5cf6'}]}>REP COUNT</Text>
              <View style={styles.repControlRow}>
                <TouchableOpacity style={styles.repBtn}><Minus color="#8b5cf6" size={20}/></TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <AnimatedCounter value={stats.reps} duration={400} style={{ fontSize: 32, fontWeight: '800', color: '#111', letterSpacing: -1 }} />
                  <Text style={styles.repTargetText}>/{stats.targetReps}</Text>
                </View>
                <TouchableOpacity style={styles.repBtn}><Plus color="#8b5cf6" size={20}/></TouchableOpacity>
              </View>
            </View>

            <View style={[styles.statCard, styles.calCard]}>
              <View style={styles.badgeTopRight}><Text style={[styles.badgeText, {color:'#ef4444'}]}>KC</Text></View>
              <Text style={[styles.statCardLabel, {color:'#ef4444'}]}>CALORIES</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <AnimatedCounter value={stats.calories} duration={400} style={{ fontSize: 32, fontWeight: '800', color: '#111', letterSpacing: -1 }} />
                <Text style={styles.calLabelText}> KCAL</Text>
              </View>
            </View>

            <View style={[styles.statCard, styles.timerCard]}>
              <View style={styles.badgeTopRight}><Text style={[styles.badgeText, {color:'#0ea5e9'}]}>AK</Text></View>
              <Text style={[styles.statCardLabel, {color:'#0ea5e9'}]}>TIMER</Text>
              <Text style={styles.timerValueText}>{formatTime(stats.time)}</Text>
            </View>

            <View style={[styles.statCard, styles.setCard]}>
              <View style={styles.badgeTopRight}><Text style={[styles.badgeText, {color:'#f97316'}]}>DK</Text></View>
              <Text style={[styles.statCardLabel, {color:'#f97316'}]}>SETS</Text>
              <View style={styles.setRow}>
                <Text style={styles.setValueText}>{stats.sets}<Text style={styles.setTargetText}>/{stats.targetSets}</Text></Text>
                <TouchableOpacity><ChevronUp color="#f97316" size={24} /></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* CONTROLS */}
          <View style={styles.controlsRow}>
            <TouchScale style={styles.playBtn} onPress={startDetection}>
              <Play color="#111" size={20} fill="#111" />
              <Text style={styles.playBtnText}>START</Text>
            </TouchScale>
            <TouchScale style={styles.stopBtn} onPress={stopDetection}>
              <Square color="#111" size={20} fill="#111" />
              <Text style={styles.stopBtnText}>STOP</Text>
            </TouchScale>
            <TouchScale 
              style={styles.saveBtn}
              onPress={async () => {
                stopDetection();
                try {
                  await fetch(`${BACKEND_URL}/api/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      workout: workoutId,
                      reps: stats.reps,
                      calories: stats.calories,
                      time: stats.time,
                      sets: stats.sets,
                      accuracy: stats.accuracy
                    })
                  });
                  
                  // Update local mobile dashboard context
                  await updateDashboard({
                    workoutsCompleted: dashboardData.workoutsCompleted + 1,
                    caloriesBurned: dashboardData.caloriesBurned + stats.calories,
                    averageAccuracy: dashboardData.averageAccuracy === 0 
                      ? stats.accuracy 
                      : Math.round((dashboardData.averageAccuracy + stats.accuracy) / 2)
                  });
                  
                } catch (e) {
                  console.log("Error saving workout to DB", e);
                }
                Alert.alert("Workout Saved", "Your progress has been synced!");
                navigation.navigate('Progress');
              }}
            >
              <Save color="#fff" size={20} />
              <Text style={styles.saveBtnText}>SAVE</Text>
            </TouchScale>
          </View>
        </View>

        {/* WORKOUT DETAILS (SCROLLABLE CONTENT) */}
        <View style={styles.detailsContainer}>

          {/* Reference Exercise Video */}
          <View style={styles.referenceVideoCard}>
            <View style={styles.referenceVideoHeader}>
              <VideoIcon color="#111" size={24} />
              <Text style={styles.referenceVideoTitle}>Reference Exercise Video</Text>
            </View>
            
            <View style={styles.referenceVideoBox}>
              {details?.video?.localVideoName ? (
                <VideoView
                  player={player}
                  style={styles.localVideoPlayer}
                  nativeControls={true}
                />
              ) : (
                <View style={styles.noVideoFallback}>
                  <AlertCircle color="#ef4444" size={32} />
                  <Text style={styles.noVideoText}>No Reference Video Available</Text>
                </View>
              )}
            </View>
            <View style={styles.referenceVideoMeta}>
              <Text style={styles.referenceVideoName}>{details.title} Reference</Text>
              <Text style={styles.referenceVideoDuration}>{details.video?.duration}</Text>
            </View>
          </View>
          
          {/* Workout Steps */}
          <View style={styles.stepsCard}>
            <View style={styles.stepsHeader}>
              <Activity color="#111" size={24} />
              <Text style={styles.stepsTitle}>Workout Steps</Text>
            </View>
            {details.steps.map((s: any, i: number) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{s.step < 10 ? `0${s.step}` : s.step}</Text>
                </View>
                <View style={styles.stepTextWrapper}>
                  <Text style={styles.stepName}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Common Mistakes */}
          <View style={styles.mistakesCard}>
            <Text style={styles.mistakesTitle}>COMMON MISTAKES</Text>
            {details.mistakes.map((m: any, i: number) => (
              <View key={i} style={styles.mistakeRow}>
                <View style={styles.mistakeIcon}>
                  <AlertCircle color="#ef4444" size={22} />
                </View>
                <View style={styles.stepTextWrapper}>
                  <Text style={styles.mistakeName}>{m.title}</Text>
                  <Text style={styles.mistakeDesc}>{m.desc}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Posture Reference */}
          <Text style={styles.sectionTitle}>Posture Reference</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postureScroll}>
            {details.postures.map((posture: any, idx: number) => (
              <View key={idx} style={styles.postureCard}>
                <Image source={{ uri: posture.image }} style={styles.postureImage} />
                <View style={styles.postureLabelWrapper}>
                  <Text style={styles.postureLabel}>{posture.label}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Padding for Navigation Bar */}
          <View style={{ height: 100 }} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  permissionText: { color: '#111', textAlign: 'center', marginTop: 50 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  headerTitleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  headerSubtitle: { fontSize: 10, color: '#64748b', fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#cbd5e1' },

  // Camera
  cameraContainer: { width: '100%', height: height * 0.65, backgroundColor: '#0f172a', position: 'relative' },
  camera: { flex: 1 },
  aiStandbyBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  yellowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b', marginRight: 6 },
  aiStandbyText: { fontSize: 12, fontWeight: '800', color: '#334155' },

  // HUD Card
  hudCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 20, marginTop: -40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10 },
  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  hudTitle: { fontSize: 12, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 },
  accuracyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  accuracyLabel: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  accuracyValue: { fontSize: 18, fontWeight: '800', color: '#475569' },
  progressBarTrack: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, marginBottom: 20, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#475569', borderRadius: 2 },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', height: 85, borderRadius: 12, padding: 12, marginBottom: 12, position: 'relative', borderWidth: 1, justifyContent: 'space-between' },
  badgeTopRight: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 9, fontWeight: '800' },
  statCardLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  
  repCard: { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' },
  repControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  repBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:4 },
  repValueText: { fontSize: 22, fontWeight: '800', color: '#7c3aed' },
  repTargetText: { fontSize: 14, color: '#a78bfa' },

  calCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  calValueText: { fontSize: 22, fontWeight: '800', color: '#ef4444', textAlign: 'center', marginTop: 4 },
  calLabelText: { fontSize: 12, color: '#f87171' },

  timerCard: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  timerValueText: { fontSize: 22, fontWeight: '800', color: '#0ea5e9', textAlign: 'center', marginTop: 4 },

  setCard: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  setValueText: { fontSize: 22, fontWeight: '800', color: '#f97316', marginRight: 10 },
  setTargetText: { fontSize: 14, color: '#fdba74' },

  // Controls Row
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  playBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14 },
  playBtnText: { color: '#111', fontWeight: '800', marginLeft: 8, fontSize: 14 },
  stopBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14 },
  stopBtnText: { color: '#111', fontWeight: '800', marginLeft: 8, fontSize: 14 },
  saveBtn: { flex: 1, backgroundColor: '#0f172a', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14 },
  saveBtnText: { color: '#fff', fontWeight: '800', marginLeft: 8, fontSize: 14 },

  // Details Container
  detailsContainer: { paddingHorizontal: 15, paddingTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 15 },
  
  // Reference Video Styles
  referenceVideoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, marginBottom: 25 },
  referenceVideoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  referenceVideoTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  referenceVideoBox: { width: '100%', height: 350, backgroundColor: '#0f172a', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  localVideoPlayer: { width: '100%', height: '100%' },
  noVideoFallback: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  noVideoText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
  referenceVideoMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referenceVideoName: { fontSize: 16, fontWeight: '700', color: '#111' },
  referenceVideoDuration: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  
  // Postures
  postureScroll: { marginBottom: 30 },
  postureCard: { width: 280, height: 160, borderRadius: 16, overflow: 'hidden', marginRight: 15, position: 'relative' },
  postureImage: { width: '100%', height: '100%' },
  postureLabelWrapper: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  postureLabel: { fontSize: 10, fontWeight: '800', color: '#1e293b' },



  // Steps Card
  stepsCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepsTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginLeft: 10 },
  stepRow: { flexDirection: 'row', marginBottom: 25 },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNum: { fontSize: 14, fontWeight: '800', color: '#334155' },
  stepTextWrapper: { flex: 1, justifyContent: 'center' },
  stepName: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },

  // Mistakes Card
  mistakesCard: { backgroundColor: '#fef2f2', borderRadius: 24, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#fecaca' },
  mistakesTitle: { fontSize: 12, fontWeight: '800', color: '#b91c1c', letterSpacing: 1, marginBottom: 20 },
  mistakeRow: { flexDirection: 'row', marginBottom: 20 },
  mistakeIcon: { marginRight: 15, marginTop: 2 },
  mistakeName: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  mistakeDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
});
