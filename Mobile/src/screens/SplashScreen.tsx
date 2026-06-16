import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell } from 'lucide-react-native';
import { MotiView } from 'moti';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Generate some random positions for particles
const particles = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * width,
  top: Math.random() * height,
  delay: Math.random() * 2000,
  duration: Math.random() * 3000 + 3000,
}));

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    // Navigate to Login after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Dark Blue Gradient Background */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2A3446" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#202836" stopOpacity="1" />
            <Stop offset="1" stopColor="#151A24" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      </Svg>

      {/* Subtle Particle Background */}
      {particles.map((p) => (
        <MotiView
          key={p.id}
          from={{ opacity: 0.1, translateY: 0 }}
          animate={{ opacity: [0.1, 0.4, 0.1], translateY: -50 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: p.duration,
            delay: p.delay,
          }}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#ffffff',
          }}
        />
      ))}

      <SafeAreaView style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 200 }}
          style={styles.iconContainer}
        >
          {/* Glassmorphism Circle */}
          <View style={styles.circle}>
            <Dumbbell color="#ffffff" size={40} strokeWidth={2.5} />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 600 }}
          style={styles.textContainer}
        >
          <Text style={styles.title}>AURAFIT AI</Text>
          <Text style={styles.subtitle}>SMART FITNESS. SMARTER YOU.</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 800, delay: 1000 }}
          style={styles.loadingContainer}
        >
          <View style={styles.progressBarTrack}>
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ type: 'timing', duration: 2500, delay: 1200 }}
              style={styles.progressBarFill}
            />
          </View>
          <Text style={styles.loadingText}>INITIALIZING AI FITNESS ENGINE...</Text>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151A24',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
    marginTop: -80, // slightly off-center towards top as in reference
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    // shadow for glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressBarTrack: {
    width: '70%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
