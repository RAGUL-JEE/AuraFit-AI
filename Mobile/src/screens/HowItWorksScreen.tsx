import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, Clock, Cpu, Book } from 'lucide-react-native';
import Constants from 'expo-constants';
import GlobalHeader from '../components/GlobalHeader';

const hostUri = Constants.expoConfig?.hostUri;
const localIp = hostUri ? hostUri.split(':')[0] : '192.168.1.100';
const imageBaseUrl = `http://${localIp}:5173`;

const { width } = Dimensions.get('window');

export default function HowItWorksScreen({ navigation }: any) {
  const steps = [
    { num: '01', title: 'Set Up Your Space', desc: 'Position your device 6–8 feet away. Our AI maps your floor and detects the optimal field of view.', img: require('../../assets/images/setup_workout_space.png') },
    { num: '02', title: 'Start Your Set', desc: 'Begin your movement. Aura AI tracks 32 kinetic points in real-time, monitoring depth, speed, and path consistency.', img: require('../../assets/images/start_workout_set.png') },
    { num: '03', title: 'Refine Your Form', desc: 'Receive instant feedback. If form breaks down, the session pauses to show an expert correction tutorial.', img: require('../../assets/images/refine_workout_form.png') },
    { num: '04', title: 'Track Progress', desc: 'Review comprehensive velocity charts and range-of-motion maps synced to your profile.', img: require('../../assets/images/track_workout_progress.png') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="How It Works" subtitle="Scientific Protocol" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <Text style={styles.heroBadge}>SCIENTIFIC PROTOCOL</Text>
          <Text style={styles.heroTitle}>Lab-Grade Performance{'\n'}at Home</Text>
          <Text style={styles.heroDesc}>
            Precision Coach uses high-fidelity computer vision to analyze every millimeter of your movement, bringing elite-level biomechanics coaching to your living room.
          </Text>

          <View style={styles.heroImageContainer}>
            <Image source={require('../../assets/images/how_it_works_hero.png')} style={styles.heroImage} />
            <View style={styles.trackingOverlay}>
              <View style={styles.radarBox}>
                <View style={styles.radarDot} />
              </View>
              <View>
                <Text style={styles.trackingLabel}>TRACKING STATUS</Text>
                <Text style={styles.trackingValue}>17 Points Active</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.protocolSection}>
          <Text style={styles.sectionTitleCenter}>The Precision Protocol</Text>
          <View style={styles.titleUnderline} />
          
          <View style={styles.stepsGrid}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepCard}>
                <View style={styles.stepImageWrapper}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{step.num}</Text>
                  </View>
                  <Image source={step.img} style={styles.stepImage} />
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.techSection}>
          <Text style={styles.sectionTitle}>The Tech Behind the Gains</Text>
          
          <View style={styles.techCards}>
            <View style={[styles.techCard, { borderColor: '#dbeafe' }]}>
              <View style={[styles.techIcon, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <Cpu size={20} color="#2563eb" />
              </View>
              <View style={styles.techContent}>
                <Text style={styles.techTitle}>Neural Kinetic Engine</Text>
                <Text style={styles.techDesc}>Proprietary AI models trained on 50,000+ professional athlete movement patterns. Our engine doesn't just see you—it understands the physics of your exertion.</Text>
              </View>
            </View>

            <View style={[styles.techCard, { borderColor: '#f3e8ff' }]}>
              <View style={[styles.techIcon, { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }]}>
                <Video size={20} color="#7c3aed" />
              </View>
              <View style={styles.techContent}>
                <Text style={styles.techTitle}>Real-time Analysis</Text>
                <Text style={styles.techDesc}>Every rep is dissected into three phases: Eccentric, Isometric, and Concentric. Optimize your tempo for maximum hypertrophy.</Text>
              </View>
            </View>

            <View style={[styles.techCard, { borderColor: '#d1fae5' }]}>
              <View style={[styles.techIcon, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                <Book size={20} color="#059669" />
              </View>
              <View style={styles.techContent}>
                <Text style={styles.techTitle}>Expert Guides</Text>
                <Text style={styles.techDesc}>Library of over 1,200 tutorials mapped to your specific biomechanical weaknesses identified by the AI.</Text>
              </View>
            </View>

            <View style={[styles.techCard, { borderColor: '#fef3c7' }]}>
              <View style={[styles.techIcon, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
                <Clock size={20} color="#d97706" />
              </View>
              <View style={styles.techContent}>
                <Text style={styles.techTitle}>Privacy-First Processing</Text>
                <Text style={styles.techDesc}>All video data is processed locally on your device; only anonymized numerical data points are synced to the cloud.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to elevate your training?</Text>
          <Text style={styles.ctaDesc}>Join 40,000+ athletes who have replaced guesswork with precision.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Workouts')} style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Start Your First Workout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  heroSection: { marginBottom: 40 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: '#091426', color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#091426', lineHeight: 44, marginBottom: 16 },
  heroDesc: { fontSize: 16, color: '#64748B', lineHeight: 24, marginBottom: 32 },
  heroImageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 280, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  trackingOverlay: { position: 'absolute', bottom: -20, left: 24, backgroundColor: '#fff', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radarBox: { width: 40, height: 40, backgroundColor: '#091426', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  radarDot: { width: 10, height: 10, backgroundColor: '#10B981', borderRadius: 5 },
  trackingLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
  trackingValue: { fontSize: 14, fontWeight: 'bold', color: '#091426' },
  protocolSection: { marginBottom: 40, marginTop: 24 },
  sectionTitleCenter: { fontSize: 24, fontWeight: 'bold', color: '#091426', textAlign: 'center', marginBottom: 8 },
  titleUnderline: { width: 60, height: 4, backgroundColor: '#091426', borderRadius: 2, alignSelf: 'center', marginBottom: 32 },
  stepsGrid: { gap: 32 },
  stepCard: { alignItems: 'center' },
  stepImageWrapper: { position: 'relative', width: 140, height: 140, borderRadius: 24, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fff', marginBottom: 16 },
  stepNumberBadge: { position: 'absolute', top: -12, left: -12, width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  stepNumberText: { fontSize: 14, fontWeight: 'bold', color: '#091426' },
  stepImage: { width: '100%', height: '100%', borderRadius: 22, resizeMode: 'cover' },
  stepTitle: { fontSize: 18, fontWeight: '900', color: '#091426', marginBottom: 8, textAlign: 'center' },
  stepDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  techSection: { marginBottom: 40 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#091426', marginBottom: 24 },
  techCards: { gap: 16 },
  techCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 2, flexDirection: 'row', gap: 16 },
  techIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  techContent: { flex: 1 },
  techTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  techDesc: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  ctaSection: { backgroundColor: '#091426', borderRadius: 24, padding: 32, alignItems: 'center' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  ctaDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24 },
  ctaBtnText: { color: '#091426', fontWeight: 'bold', fontSize: 16 },
});
