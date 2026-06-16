import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Info, 
  Flame, 
  CheckCircle2, 
  Microscope, 
  Zap, 
  Bot, 
  Eye, 
  TrendingUp, 
  PersonStanding, 
  CalendarCheck 
} from 'lucide-react-native';
import GlobalHeader from '../components/GlobalHeader';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import TouchScale from '../components/animations/TouchScale';
import { MotiView } from 'moti';
import { useDashboard } from '../context/DashboardContext';

export default function HomeScreen({ navigation }: any) {
  const { dashboardData, isLoading } = useDashboard();
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="Home" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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

        {/* Main Banner */}
        <View style={styles.bannerContainer}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' }}
            style={styles.bannerImage}
            imageStyle={{ borderRadius: 16, opacity: 0.15 }}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerBadgeContainer}>
                <View style={styles.bannerBadge}>
                  <Info color="#fff" size={14} />
                  <Text style={styles.bannerBadgeText}>Welcome back, coach!</Text>
                </View>
              </View>

              <Text style={styles.bannerTitle}>SMART FITNESS.</Text>
              <Text style={styles.bannerTitle}>SMARTER YOU.</Text>
              <Text style={styles.bannerDesc}>
                Aurafit AI helps you train smarter with real-time pose detection and personalized guidance.
              </Text>

              <View style={styles.bannerButtons}>
                <TouchScale style={styles.primaryBtn} onPress={() => navigation.navigate('Workouts')}>
                  <Text style={styles.primaryBtnText}>Get Started</Text>
                </TouchScale>
                <TouchScale style={styles.secondaryBtn} onPress={() => navigation.navigate('HowItWorks')}>
                  <Text style={styles.secondaryBtnText}>How It Works</Text>
                </TouchScale>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Daily Metrics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Metrics</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Today</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {/* Card 1 */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 100 }}
            style={[styles.metricCard, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}
          >
            <Flame color="#ef4444" size={22} />
            <AnimatedCounter value={dashboardData.caloriesBurned} duration={1800} style={[styles.metricValue, { color: '#0f172a' }]} />
            <Text style={styles.metricLabel}>Calories Burned</Text>
          </MotiView>
          
          {/* Card 2 */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            style={[styles.metricCard, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}
          >
            <CheckCircle2 color="#10b981" size={22} />
            <AnimatedCounter value={dashboardData.workoutsCompleted} duration={1800} style={[styles.metricValue, { color: '#0f172a' }]} />
            <Text style={styles.metricLabel}>Workouts Comp.</Text>
          </MotiView>
          
          {/* Card 3 */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 300 }}
            style={[styles.metricCard, { backgroundColor: '#f5f3ff', borderColor: '#ede9fe' }]}
          >
            <Microscope color="#8b5cf6" size={22} />
            <AnimatedCounter value={dashboardData.averageAccuracy} suffix="%" duration={1800} style={[styles.metricValue, { color: '#0f172a' }]} />
            <Text style={styles.metricLabel}>Average Accuracy</Text>
          </MotiView>

          {/* Card 4 */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 400 }}
            style={[styles.metricCard, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}
          >
            <Zap color="#f97316" size={22} />
            <AnimatedCounter value={dashboardData.dayStreak} duration={1800} style={[styles.metricValue, { color: '#0f172a' }]} />
            <Text style={styles.metricLabel}>Day Streak</Text>
          </MotiView>
        </View>

        {/* Floating AI Status Card */}
        <View style={styles.aiStatusCard}>
          <View style={styles.aiStatusIconWrapper}>
            <View style={styles.aiStatusIcon}>
              <Bot color="#475569" size={20} />
            </View>
          </View>
          <Text style={styles.aiStatusText}>
            AI Coach is standing by to posture correct...
          </Text>
        </View>

        {/* Intelligent Features */}
        <Text style={styles.sectionTitle}>Intelligent Features</Text>
        
        {/* Feature 1 */}
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#eff6ff' }]}>
            <Eye color="#3b82f6" size={24} />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Real-time Pose Detection</Text>
            <Text style={styles.featureDesc}>Advanced computer vision for form tracking.</Text>
          </View>
        </View>

        {/* Feature 2 */}
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#f0fdf4' }]}>
            <TrendingUp color="#10b981" size={24} />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Performance Tracking</Text>
            <Text style={styles.featureDesc}>Detailed analytics of your strength growth.</Text>
          </View>
        </View>

        {/* Feature 3 */}
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#fff7ed' }]}>
            <PersonStanding color="#f97316" size={24} />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Posture Correction</Text>
            <Text style={styles.featureDesc}>Instant haptic and vocal feedback for safe lifting.</Text>
          </View>
        </View>

        {/* Feature 4 */}
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#faf5ff' }]}>
            <CalendarCheck color="#c084fc" size={24} />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Workout Plans</Text>
            <Text style={styles.featureDesc}>Custom routines generated dynamically by server AI models.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Very light greyish blue background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bannerContainer: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#e2e8f0', // Fallback behind the image
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    borderRadius: 16,
  },
  bannerContent: {
    padding: 20,
    paddingTop: 16,
  },
  bannerBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  bannerTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  bannerDesc: {
    color: '#475569',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 18,
    paddingRight: 20,
  },
  bannerButtons: {
    flexDirection: 'row',
  },
  primaryBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  sectionLink: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -1,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  aiStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 10,
  },
  aiStatusIconWrapper: {
    marginTop: -36,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 30,
    padding: 6,
  },
  aiStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  aiStatusText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
});
