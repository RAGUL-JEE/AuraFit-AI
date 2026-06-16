import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Download, Plus, Flame, Dumbbell, Zap, Medal, Droplets, Moon, ChevronDown } from 'lucide-react-native';
import GlobalHeader from '../components/GlobalHeader';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withDelay, runOnJS } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useDashboard } from '../context/DashboardContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width } = Dimensions.get('window');

function IconBadge({ Icon, color, bg }: { Icon: any; color: string; bg: string }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: bg }]}>
      <Icon color={color} size={20} strokeWidth={2.5} />
    </View>
  );
}

export default function ProgressScreen() {
  const { dashboardData } = useDashboard();
  
  const [weight, setWeight] = useState(78);
  const [heightVal, setHeightVal] = useState(182);

  const pathProgress = useSharedValue(500);
  const fillOpacity = useSharedValue(0);
  const [chartFinished, setChartFinished] = useState(false);

  React.useEffect(() => {
    setChartFinished(false);
    pathProgress.value = withTiming(0, {
      duration: 1500,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
    fillOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }, (finished) => {
      if (finished) {
        runOnJS(setChartFinished)(true);
      }
    }));
  }, []);

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: pathProgress.value,
  }));

  const animatedFillProps = useAnimatedProps(() => ({
    opacity: fillOpacity.value,
  }));

  // BMI Calculation
  const bmi = (weight / ((heightVal / 100) * (heightVal / 100))).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader title="Progress Overview" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity><Menu color="#111" size={28} /></TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>Progress Overview</Text>
              <Text style={styles.headerSubtitle}>Real-time biomechanical data and analysis</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}><Download color="#111" size={24} /></TouchableOpacity>
            <TouchableOpacity style={styles.plusBtn}><Plus color="#fff" size={24} /></TouchableOpacity>
          </View>
        </View>

        {/* 6-Card Grid */}
        <View style={styles.gridContainer}>
          {/* Day Streak */}
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100, type: 'spring' }} style={styles.gridCard}>
            <IconBadge Icon={Flame} color="#f97316" bg="#fff7ed" />
            <Text style={styles.cardLabel}>DAY STREAK</Text>
            <AnimatedCounter value={dashboardData.dayStreak} duration={1000} style={[styles.cardValue, { color: '#ea580c' }]} />
            <View style={styles.pillBadge}><Text style={styles.pillText}>Start Today</Text></View>
          </MotiView>

          {/* Workouts */}
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 150, type: 'spring' }} style={styles.gridCard}>
            <IconBadge Icon={Dumbbell} color="#3b82f6" bg="#eff6ff" />
            <Text style={styles.cardLabel}>WORKOUTS</Text>
            <AnimatedCounter value={dashboardData.workoutsCompleted} duration={1500} style={[styles.cardValue, { color: '#2563eb' }]} />
            <View style={styles.pillBadge}><Text style={styles.pillText}>Completed</Text></View>
          </MotiView>

          {/* Calories */}
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 200, type: 'spring' }} style={styles.gridCard}>
            <IconBadge Icon={Zap} color="#ef4444" bg="#fef2f2" />
            <Text style={styles.cardLabel}>CALORIES</Text>
            <AnimatedCounter value={dashboardData.caloriesBurned} suffix=" kcal" duration={1800} style={[styles.cardValue, { color: '#dc2626' }]} />
            <View style={[styles.pillBadge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.pillText, { color: '#16a34a' }]}>Total burned</Text></View>
          </MotiView>

          {/* Fitness Rank */}
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 250, type: 'spring' }} style={styles.gridCard}>
            <IconBadge Icon={Medal} color="#10b981" bg="#dcfce7" />
            <Text style={styles.cardLabel}>FITNESS RANK</Text>
            <Text style={[styles.cardValue, { color: '#059669' }]}>{dashboardData.fitnessRank}</Text>
            <View style={styles.pillBadge}><Text style={styles.pillText}>Elite Performance</Text></View>
          </MotiView>

          {/* Water */}
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 300, type: 'spring' }} style={styles.gridCard}>
            <IconBadge Icon={Droplets} color="#0ea5e9" bg="#e0f2fe" />
            <Text style={styles.cardLabel}>WATER</Text>
            <AnimatedCounter value={dashboardData.waterIntake} decimals={1} suffix="L" duration={1500} style={[styles.cardValue, { color: '#0284c7' }]} />
            <View style={styles.pillBadge}><Text style={styles.pillText}>85% Goal</Text></View>
          </MotiView>

          {/* Sleep Avg */}
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 350, type: 'spring' }} style={styles.gridCard}>
            <IconBadge Icon={Moon} color="#a855f7" bg="#f3e8ff" />
            <Text style={styles.cardLabel}>SLEEP AVG</Text>
            <AnimatedCounter value={dashboardData.sleepAverage} decimals={1} suffix="h" duration={1500} style={[styles.cardValue, { color: '#9333ea' }]} />
            <View style={[styles.pillBadge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.pillText, { color: '#16a34a' }]}>Optimal Recovery</Text></View>
          </MotiView>
        </View>

        {/* Accuracy Trend Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Accuracy Trend (Last 30 Days)</Text>
            <TouchableOpacity style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>Last 30 Days</Text>
              <ChevronDown color="#64748b" size={16} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartWrapper}>
            {/* Y-Axis Labels */}
            <View style={styles.yAxis}>
              <Text style={styles.axisText}>100%</Text>
              <Text style={styles.axisText}>67%</Text>
              <Text style={styles.axisText}>33%</Text>
              <Text style={styles.axisText}>0%</Text>
            </View>
            
            {/* Graph Area */}
            <View style={styles.graphArea}>
              {/* Grid Lines */}
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, { top: '33%' }]} />
              <View style={[styles.gridLine, { top: '66%' }]} />
              <View style={[styles.gridLine, { top: '100%' }]} />

              <Svg height="100%" width="100%" viewBox="0 0 300 120" style={{ position: 'absolute' }}>
                <Defs>
                  <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#38bdf8" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#38bdf8" stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>
                
                {chartFinished ? (
                  <>
                    <Path 
                      d="M0,120 C30,120 40,30 70,20 C100,10 130,15 160,25 C190,35 210,15 240,20 C270,25 290,20 300,22 L300,120 Z"
                      fill="url(#grad)"
                      opacity={1}
                    />
                    <Path 
                      d="M0,120 C30,120 40,30 70,20 C100,10 130,15 160,25 C190,35 210,15 240,20 C270,25 290,20 300,22"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                    />
                  </>
                ) : (
                  <>
                    <AnimatedPath 
                      d="M0,120 C30,120 40,30 70,20 C100,10 130,15 160,25 C190,35 210,15 240,20 C270,25 290,20 300,22 L300,120 Z"
                      fill="url(#grad)"
                      animatedProps={animatedFillProps}
                    />
                    <AnimatedPath 
                      d="M0,120 C30,120 40,30 70,20 C100,10 130,15 160,25 C190,35 210,15 240,20 C270,25 290,20 300,22"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeDasharray="500"
                      animatedProps={animatedPathProps}
                    />
                  </>
                )}

                {/* Nodes */}
                <Circle cx="0" cy="120" r="3" fill="#8b5cf6" />
                <Circle cx="70" cy="20" r="3" fill="#8b5cf6" />
                <Circle cx="160" cy="25" r="3" fill="#8b5cf6" />
                <Circle cx="240" cy="20" r="3" fill="#8b5cf6" />
                <Circle cx="300" cy="22" r="3" fill="#8b5cf6" />

                {/* Glowing Active Dot */}
                <Circle cx="45" cy="65" r="6" fill="#22d3ee" opacity="0.5" />
                <Circle cx="45" cy="65" r="4" fill="#06b6d4" />
              </Svg>

              <View style={styles.xAxis}>
                <Text style={styles.axisText}>May 24</Text>
                <Text style={styles.axisText}>Jun 2</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Body Metrics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          <Text style={styles.sectionSubtitle}>AI calibrated weight-to-mass ratio</Text>

          {/* Weight Slider Mock */}
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Weight</Text>
            <Text style={styles.sliderValue}>{weight} kg</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: '55%' }]} />
            <View style={[styles.sliderThumb, { left: '55%' }]} />
          </View>

          {/* Height Slider Mock */}
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Height</Text>
            <Text style={styles.sliderValue}>{heightVal} cm</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: '75%' }]} />
            <View style={[styles.sliderThumb, { left: '75%' }]} />
          </View>

          {/* BMI Box */}
          <View style={styles.bmiBox}>
            <Text style={styles.bmiLabel}>CURRENT BMI</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <View style={styles.bmiBadge}>
              <View style={styles.yellowDot} />
              <Text style={styles.bmiBadgeText}>HEALTHY RANGE</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.sectionCard}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>
              <Text style={styles.sectionSubtitle}>Intensity vs Completion frequency</Text>
            </View>
            <View style={styles.togglePill}>
              <View style={styles.toggleActive}><Text style={styles.toggleActiveText}>Activity</Text></View>
              <View style={styles.toggleInactive}><Text style={styles.toggleInactiveText}>Calories</Text></View>
            </View>
          </View>

          <View style={styles.barChartContainer}>
            <View style={styles.barChartYAxis}>
              <Text style={styles.axisText}>100%</Text>
              <Text style={styles.axisText}>50%</Text>
              <Text style={styles.axisText}>0%</Text>
            </View>
            <View style={styles.barsArea}>
              {dashboardData.weeklyActivity.map((bar, i) => (
                <View key={i} style={styles.singleBarCol}>
                  <View style={styles.barStack}>
                    <View style={[styles.barTopHalf, { height: bar.h2 as any }]} />
                    <View style={[styles.barBottomHalf, { height: bar.h1 as any }]} />
                  </View>
                  <Text style={[styles.barDayText, bar.active && { color: '#ef4444', fontWeight: '700' }]}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 10 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  headerTitleBox: {},
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 6 },
  plusBtn: { backgroundColor: '#0f172a', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 15, marginBottom: 25 },
  gridCard: { width: (width - 50) / 3, backgroundColor: '#fff', borderRadius: 20, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 10, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  pillBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  pillText: { fontSize: 9, fontWeight: '700', color: '#64748b' },

  // Sections
  sectionCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  sectionSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 20 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  dropdownText: { fontSize: 12, fontWeight: '600', color: '#334155' },

  // Chart
  chartWrapper: { flexDirection: 'row', height: 160 },
  yAxis: { justifyContent: 'space-between', paddingRight: 10, paddingBottom: 25 },
  axisText: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
  graphArea: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#f1f5f9', borderStyle: 'dashed' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: -5, width: '100%' },

  // Sliders
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  sliderValue: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  sliderTrack: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, marginBottom: 25, position: 'relative', justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', backgroundColor: '#cbd5e1', borderRadius: 2, left: 0 },
  sliderThumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#1e293b', marginLeft: -7 },

  // BMI
  bmiBox: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 5 },
  bmiLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, marginBottom: 4 },
  bmiValue: { fontSize: 36, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  bmiBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  yellowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#eab308', marginRight: 6 },
  bmiBadgeText: { fontSize: 10, fontWeight: '800', color: '#16a34a' },

  // Weekly Activity
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  togglePill: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 20, padding: 4 },
  toggleActive: { backgroundColor: '#0f172a', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  toggleActiveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  toggleInactive: { paddingHorizontal: 14, paddingVertical: 6, justifyContent: 'center' },
  toggleInactiveText: { color: '#64748b', fontSize: 11, fontWeight: '600' },

  barChartContainer: { flexDirection: 'row', height: 140 },
  barChartYAxis: { justifyContent: 'space-between', paddingRight: 15, paddingBottom: 25 },
  barsArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 25 },
  singleBarCol: { alignItems: 'center', width: 24, height: '100%', justifyContent: 'flex-end' },
  barStack: { width: 16, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barTopHalf: { width: '100%', backgroundColor: '#bfdbfe', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barBottomHalf: { width: '100%', backgroundColor: '#3b82f6' },
  barDayText: { position: 'absolute', bottom: -25, fontSize: 10, color: '#94a3b8', fontWeight: '500' }
});
