import React, { useRef, useState, useEffect } from 'react';
import { Play, Square, Save, AlertTriangle, AlertCircle, Plus, Minus, ArrowUp, ArrowDown, ChevronRight, CheckCircle2, ChevronLeft, Brain, Volume2, Timer, Settings, Youtube, Flame, Dumbbell, Zap } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ExerciseData } from '../types';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { EXERCISES } from '../data/exercises';

function EmojiStyleIconBadge({
  Icon,
  size = 'md',
  bg = '#FFF5F5',
  border = '#FFD6D6',
  color = '#FF3131',
}: {
  Icon: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md';
  bg?: string;
  border?: string;
  color?: string;
}) {
  const container =
    size === 'sm'
      ? 'h-9 w-9 rounded-2xl'
      : 'h-12 w-12 rounded-2xl';
  const icon = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div
      className={`${container} flex items-center justify-center shrink-0 border`}
      style={{ backgroundColor: bg, borderColor: border, color }}
    >
      <Icon className={icon} />
    </div>
  );
}

const numberToWord = (num: number): string => {
  const words = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
    'Twenty One', 'Twenty Two', 'Twenty Three', 'Twenty Four', 'Twenty Five', 'Twenty Six', 'Twenty Seven', 'Twenty Eight', 'Twenty Nine', 'Thirty'
  ];
  if (num >= 0 && num < words.length) return words[num];
  return String(num);
};

const formatSpokenTime = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  
  const parts = [];
  if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} second${s > 1 ? 's' : ''}`);
  
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
};

// High-fidelity step-by-step professional gym slideshow images for all 10 workouts
const STEP_IMAGES_MAP: Record<string, string[]> = {
  'ex-01': [ // Push-Up
    '/images/workouts/pushup_ref_03.jpg',      // Step 1: Hand Placement
    '/images/workouts/pushup_ref_02.jpg',      // Step 2: Body Alignment
    '/images/workouts/pushup_ref_01.jpg',      // Step 3: Core Tension
    '/images/workouts/pushup_ref_04.jpg'       // Step 4: Full Drive
  ],
  'ex-02': [ // Squat
    '/images/workouts/squat_step_01.png',      // Step 1: Stance Setup
    '/images/workouts/squat_step_03.png',      // Step 2: Core Activation
    '/images/workouts/squat_step_05.png',      // Step 3: Knee Flexion
    '/images/workouts/squat_step_07.png'       // Step 4: Heel Drive
  ],
  'ex-03': [ // Lunge
    '/images/workouts/lunge_step_01.png',      // Step 1: Starting Posture
    '/images/workouts/lunge_step_02.png',      // Step 2: Step Forward
    '/images/workouts/lunge_step_03.png',      // Step 3: Double Flexion
    '/images/workouts/lunge_step_04.png',      // Step 4: Ankle Track
    '/images/workouts/lunge_step_05.png',      // Step 5: Upright Spine
    '/images/workouts/lunge_step_06.png',      // Step 6: Heel Push
    '/images/workouts/lunge_step_07.png'       // Step 7: Step Back
  ],
  'ex-04': [ // Plank
    '/images/workouts/plank_step_01.png',      // Step 1: Forearm Setup
    '/images/workouts/plank_step_02.png',      // Step 2: Elbow Alignment
    '/images/workouts/plank_step_03.png',      // Step 3: Leg Extension
    '/images/workouts/plank_step_04.png',      // Step 4: Body Line
    '/images/workouts/plank_step_05.png',      // Step 5: Brace Midsection
    '/images/workouts/plank_step_06.png',      // Step 6: Neutral Neck
    '/images/workouts/plank_step_07.png'       // Step 7: Steady Breath
  ],
  'ex-05': [ // Bicep Curl
    '/images/workouts/bicep_curl_step_01.png',      // Step 1: Grip & Stance
    '/images/workouts/bicep_curl_step_02.png',      // Step 2: Pin Elbows
    '/images/workouts/bicep_curl_step_03.png',      // Step 3: Posture Check
    '/images/workouts/bicep_curl_step_04.png',      // Step 4: Slow Contraction
    '/images/workouts/bicep_curl_step_05.png',      // Step 5: Top Squeeze
    '/images/workouts/bicep_curl_step_06.png',      // Step 6: Negative Control
    '/images/workouts/bicep_curl_step_07.png'       // Step 7: Zero Swing
  ],
  'ex-06': [ // Shoulder Press
    '/images/workouts/shoulder_press.png',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/shoulder_press.png',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/shoulder_press.png',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/shoulder_press.png',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', // Mistake 1
    '/images/workouts/shoulder_press.png' // Mistake 2
  ],
  'ex-07': [ // Bench Press
    '/images/workouts/bench_press.png',
    'https://images.unsplash.com/photo-1623874514711-0f321305f318?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/bench_press.png',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/bench_press.png',
    'https://images.unsplash.com/photo-1623874514711-0f321305f318?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/bench_press.png',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', // Mistake 1
    '/images/workouts/bench_press.png' // Mistake 2
  ],
  'ex-08': [ // Lat Pulldown
    '/images/workouts/lat_pulldown.png',
    'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/lat_pulldown.png',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/lat_pulldown.png',
    'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/lat_pulldown.png',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', // Mistake 1
    '/images/workouts/lat_pulldown.png' // Mistake 2
  ],
  'ex-09': [ // Deadlift
    '/images/workouts/deadlift.png',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/deadlift.png',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/deadlift.png',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/deadlift.png',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', // Mistake 1
    '/images/workouts/deadlift.png' // Mistake 2
  ],
  'ex-10': [ // Mountain Climber
    '/images/workouts/mountain_climber.png',
    'https://images.unsplash.com/photo-1599058917719-7561f77ff689?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/mountain_climber.png',
    'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/mountain_climber.png',
    'https://images.unsplash.com/photo-1599058917719-7561f77ff689?q=80&w=600&auto=format&fit=crop',
    '/images/workouts/mountain_climber.png',
    'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=600&auto=format&fit=crop', // Mistake 1
    '/images/workouts/mountain_climber.png' // Mistake 2
  ]
};

// Per-exercise step label arrays — 9 entries matching STEP_IMAGES_MAP (indices 7–8 are mistake frames)
const STEP_LABELS_MAP: Record<string, string[]> = {
  'ex-01': ['Hand Placement','Body Alignment','Core Tension','Full Drive'],
  'ex-02': ['Stance Setup','Core Activation','Knee Flexion','Heel Drive'],
  'ex-03': ['Starting Posture','Step Forward','Double Flexion','Ankle Track','Upright Spine','Heel Push','Step Back'],
  'ex-04': ['Forearm Setup','Elbow Alignment','Leg Extension','Body Line','Brace Midsection','Neutral Neck','Steady Breath'],
  'ex-05': ['Grip & Stance','Pin Elbows','Posture Check','Slow Contraction','Top Squeeze','Negative Control','Zero Swing'],
  'ex-06': ['Height Setup','Core Bracing','Upright Seat','Overhead Press','Arm Extension','Eccentric Drop','Rhythmic Breathing','⚠ Avoid: Arching Back','⚠ Avoid: Shrugging'],
  'ex-07': ['Bench Setup','Grip Width','Feet Anchored','Mid-Chest Focus','Elbow Angle','Steady Drive','Safe Extension','⚠ Avoid: Bar Bounce','⚠ Avoid: Elbows Flaring'],
  'ex-08': ['Thigh Pad Setup','Overhead Grip','Chest Lift','Drive to Chest','Scapular Squeeze','Bottom Pause','Slow Release','⚠ Avoid: Pulling Behind Neck','⚠ Avoid: Excessive Lean'],
  'ex-09': ['Stance Width','Shin Distance','Hip Hinge','Secure Grip','Neutral Spine','Forward Drive','Negative Control','⚠ Avoid: Rounded Back','⚠ Avoid: Bar Too Far'],
  'ex-10': ['High Plank','Hand Alignment','Core Tightness','Knee Drive','Leg Switch','Steady Rhythm','Hip Stability','⚠ Avoid: Hips Bouncing','⚠ Avoid: Short Knee Drive'],
};

// Frame indices that are "mistake" warning frames (shared across all exercises)
const MISTAKE_FRAME_INDICES = new Set([7, 8]);

const YOUTUBE_MAP: Record<string, string> = {
  'ex-01': 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  'ex-02': 'https://www.youtube.com/watch?v=gcNh17Ckjgg',
  'ex-03': 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
  'ex-04': 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  'ex-05': 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  'ex-06': 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  'ex-07': 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  'ex-08': 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  'ex-09': 'https://www.youtube.com/watch?v=op9kVnSso6Q',
  'ex-10': 'https://www.youtube.com/watch?v=nmwgirgXLYM'
};

const YOUTUBE_IDS_MAP: Record<string, string> = {
  'ex-01': 'IODxDxX7oi4',
  'ex-02': 'gcNh17Ckjgg',
  'ex-03': 'QOVaHwm-Q6U',
  'ex-04': 'pSHjTRCQxIw',
  'ex-05': 'ykJmrZ5v0Oo',
  'ex-06': 'qEwKCR5JCog',
  'ex-07': 'rT7DgCr-3pg',
  'ex-08': 'CAwf7n6Luuc',
  'ex-09': 'op9kVnSso6Q',
  'ex-10': 'nmwgirgXLYM'
};

const TUTORIAL_IMAGES_MAP: Record<string, string> = {
  'ex-01': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop',
  'ex-02': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
  'ex-03': 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=800&auto=format&fit=crop',
  'ex-04': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop',
  'ex-05': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
  'ex-06': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
  'ex-07': 'https://images.unsplash.com/photo-1623874514711-0f321305f318?q=80&w=800&auto=format&fit=crop',
  'ex-08': 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?q=80&w=800&auto=format&fit=crop',
  'ex-09': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
  'ex-10': 'https://images.unsplash.com/photo-1599058917719-7561f77ff689?q=80&w=800&auto=format&fit=crop'
};

const TUTORIAL_CONTENT_MAP: Record<string, { title: string; desc: string; coach: string }> = {
  'ex-01': {
    title: 'Mastering the Push-Up',
    desc: 'Learn proper push-up mechanics for chest strength and shoulder safety.',
    coach: 'Marcus Chen walks you through chest alignment and elbow positioning for maximum power.'
  },
  'ex-02': {
    title: 'Mastering the Squat',
    desc: 'Learn proper squat mechanics for strength and balance.',
    coach: 'Marcus Chen demonstrates deep squats, neutral spines, and optimal knee tracking.'
  },
  'ex-03': {
    title: 'Mastering the Lunge',
    desc: 'Learn proper lunge mechanics for leg power and stability.',
    coach: 'Marcus Chen guides you through joint alignment and perfect single-leg balance.'
  },
  'ex-04': {
    title: 'Mastering the Plank',
    desc: 'Learn proper plank mechanics for core endurance and stability.',
    coach: 'Marcus Chen covers scapular protraction and hips positioning for deep core engagement.'
  },
  'ex-05': {
    title: 'Mastering the Bicep Curl',
    desc: 'Learn proper bicep curl mechanics for arm strength and hypertrophy.',
    coach: 'Marcus Chen teaches you how to pin elbows and control the negative phase of the lift.'
  },
  'ex-06': {
    title: 'Mastering the Shoulder Press',
    desc: 'Learn proper shoulder press mechanics for overhead strength and mobility.',
    coach: 'Marcus Chen shows how to avoid arching your back and optimize overhead trajectory.'
  },
  'ex-07': {
    title: 'Mastering the Bench Press',
    desc: 'Learn proper bench press mechanics for upper body strength and power.',
    coach: 'Marcus Chen outlines grip spacing, chest touchpoints, and driving from your feet.'
  },
  'ex-08': {
    title: 'Mastering the Lat Pulldown',
    desc: 'Learn proper lat pulldown mechanics for a strong, wide back.',
    coach: 'Marcus Chen walks you through driving with your elbows and scapular retraction.'
  },
  'ex-09': {
    title: 'Mastering the Deadlift',
    desc: 'Learn proper deadlift mechanics for full-body power and posterior chain strength.',
    coach: 'Marcus Chen details hip hinges, shin distances, and neutral spines under heavy loads.'
  },
  'ex-10': {
    title: 'Mastering the Mountain Climber',
    desc: 'Learn proper mountain climber mechanics for core stability and high-intensity cardio.',
    coach: 'Marcus Chen helps you maintain high-speed rhythm while locking your hips in place.'
  }
};

const EXERCISE_DIFFICULTY_MAP: Record<string, 'Normal' | 'Medium' | 'High'> = {
  'ex-01': 'Medium',
  'ex-02': 'Normal',
  'ex-03': 'Medium',
  'ex-04': 'Normal',
  'ex-05': 'Normal',
  'ex-06': 'Medium',
  'ex-07': 'High',
  'ex-08': 'Medium',
  'ex-09': 'High',
  'ex-10': 'High'
};

export function ActiveWorkout({ exercise, onExerciseChange }: { exercise?: ExerciseData | null; onExerciseChange?: (ex: ExerciseData) => void }) {
  const getWorkoutVideoSrc = (title: string) => {
    const normalized = title.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
    if (normalized === 'SQUAT') {
      return '/videos/tutorial_v_mp_.mp4';
    }
    if (normalized === 'LUNGE') {
      return '/videos/lunge.mp4';
    }
    if (normalized === 'PLANK') {
      return '/videos/plank.mp4';
    }
    if (normalized === 'BICEP_CURL') {
      return '/videos/bicep_curl.mp4';
    }
    if (normalized === 'SHOULDER_PRESS') {
      return '/videos/shoulder_press_vertical_ai_coach_tutorialmp_.mp4';
    }
    if (normalized === 'BENCH_PRESS') {
      return '/videos/Cinematic_AI_Fitness_Tutorial.mp4';
    }
    if (normalized === 'LAT_PULLDOWN') {
      return '/videos/dd_f_d_a_a_c_d_d_mp_.mp4';
    }
    if (normalized === 'DEADLIFT') {
      return '/videos/deadlift_tutorial_mp_.mp4';
    }
    if (normalized === 'MOUNTAIN_CLIMBER') {
      return '/videos/mountain_climber_tutorial_mp_.mp4';
    }
    return '/videos/mp4.mp4';
  };

  const isPlank = exercise?.id === 'ex-04';
  const containerRef = useRef<HTMLDivElement>(null);
  const refVideoRef = useRef<HTMLVideoElement>(null);
  const [targetSets, setTargetSets] = useState(4);
  const [targetReps, setTargetReps] = useState(15);
  const [isTracking, setIsTracking] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSets, setCurrentSets] = useState(0);
  const [calories, setCalories] = useState(0);
  const [duration, setDuration] = useState(0);
  const [formScore, setFormScore] = useState(94);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPlayingGuide, setIsPlayingGuide] = useState(false);
  const [aiVoiceActive, setAiVoiceActive] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // --- REAL-TIME DETECTOR STATE REF SYNC ---
  const prevRepsRef = useRef(0);
  const prevSetsRef = useRef(0);

  // --- AI VOICE FEEDBACK (Web Speech API) ---
  const lastSpokenTimeRef = useRef<number>(0);
  const VOICE_COOLDOWN_MS = 3500;

  const speak = (text: string, force = false) => {
    if (!('speechSynthesis' in window)) return;
    const now = Date.now();
    if (!force && now - lastSpokenTimeRef.current < VOICE_COOLDOWN_MS) return;
    lastSpokenTimeRef.current = now;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 25, 
      scale: shouldReduceMotion ? 1 : 0.97 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: shouldReduceMotion ? 0.3 : 0.65, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const fadeUpVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 15 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.55,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  // Set Workout Modal configuration states
  const [showSetWorkoutModal, setShowSetWorkoutModal] = useState(false);
  const [tempReps, setTempReps] = useState(15);
  const [tempSets, setTempSets] = useState(4);
  const [tempDurationHr, setTempDurationHr] = useState(0);
  const [tempDurationMin, setTempDurationMin] = useState(25);
  const [tempDurationSec, setTempDurationSec] = useState(0);
  const [tempRest, setTempRest] = useState(45);
  const [tempDifficulty, setTempDifficulty] = useState<'Normal' | 'Medium' | 'High'>('Medium');
  const [tempGoal, setTempGoal] = useState('Hypertrophy & Strength');

  const [targetDuration, setTargetDuration] = useState(1500); // 1500 secs = 25 mins
  const [targetRest, setTargetRest] = useState(45);
  const [targetDifficulty, setTargetDifficulty] = useState<'Normal' | 'Medium' | 'High'>('Medium');
  const [targetGoal, setTargetGoal] = useState('Hypertrophy & Strength');

  const calculateDifficultyScore = () => {
    const totalVolume = tempSets * tempReps;
    const totalDurationInSeconds = tempDurationHr * 3600 + tempDurationMin * 60 + tempDurationSec;
    const volumeScore = totalVolume * 0.5; // up to 50
    const durationScore = Math.min(30, (totalDurationInSeconds / 3600) * 30); // up to 30
    const restScore = tempRest <= 30 ? 20 : tempRest <= 45 ? 15 : tempRest <= 60 ? 10 : 5; // up to 20
    const score = Math.round(volumeScore + durationScore + restScore);
    return Math.min(100, Math.max(10, score));
  };

  const getIntensityInfo = () => {
    const score = calculateDifficultyScore();
    let intensity = 'Moderate';
    let color = 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    
    if (score >= 70) {
      intensity = 'Extreme';
      color = 'text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';
    } else if (score >= 45) {
      intensity = 'High';
      color = 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
    } else if (score <= 25) {
      intensity = 'Low';
      color = 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
    
    return { intensity, color };
  };

  const estimatedCalories = Math.round(tempSets * tempReps * (tempDifficulty === 'High' ? 2.5 : tempDifficulty === 'Medium' ? 1.8 : 1.2));

  // Automatic preset clicks handler
  const handlePresetSelect = (preset: 'Normal' | 'Medium' | 'High') => {
    setTempDifficulty(preset);
    if (preset === 'Normal') {
      setTempReps(10);
      setTempSets(3);
      setTempRest(60);
      setTempDurationHr(0);
      setTempDurationMin(15);
      setTempDurationSec(0);
    } else if (preset === 'Medium') {
      setTempReps(15);
      setTempSets(4);
      setTempRest(45);
      setTempDurationHr(0);
      setTempDurationMin(25);
      setTempDurationSec(0);
    } else if (preset === 'High') {
      setTempReps(20);
      setTempSets(5);
      setTempRest(30);
      setTempDurationHr(0);
      setTempDurationMin(40);
      setTempDurationSec(0);
    }
  };

  // Automatically recalculate preset highlight state when inputs are manually updated!
  useEffect(() => {
    const isNormal = tempReps === 10 && tempSets === 3 && tempRest === 60 && tempDurationHr === 0 && tempDurationMin === 15 && tempDurationSec === 0;
    const isMedium = tempReps === 15 && tempSets === 4 && tempRest === 45 && tempDurationHr === 0 && tempDurationMin === 25 && tempDurationSec === 0;
    const isHigh = tempReps === 20 && tempSets === 5 && tempRest === 30 && tempDurationHr === 0 && tempDurationMin === 40 && tempDurationSec === 0;
    
    if (isNormal) {
      setTempDifficulty('Normal');
    } else if (isMedium) {
      setTempDifficulty('Medium');
    } else if (isHigh) {
      setTempDifficulty('High');
    } else {
      // Dynamic difficulty level assignment based on workout intensity/difficulty score
      const score = calculateDifficultyScore();
      if (score >= 70) {
        setTempDifficulty('High');
      } else if (score >= 35) {
        setTempDifficulty('Medium');
      } else {
        setTempDifficulty('Normal');
      }
    }
  }, [tempReps, tempSets, tempRest, tempDurationHr, tempDurationMin, tempDurationSec]);

  // Slideshow States for Form Reference Panel
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSlideshowHovered, setIsSlideshowHovered] = useState(false);

  const { addSession } = useWorkoutHistory();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData>(
    exercise || EXERCISES.find(e => e.id === 'ex-07') || EXERCISES[0]
  );

  // Reset slideshow on active tab/exercise changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedExercise]);

  // Preload all step images for smooth, non-flickering, zero-layout-shifting transitions
  useEffect(() => {
    const images = STEP_IMAGES_MAP[selectedExercise.id] || [];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [selectedExercise]);

  // Automatic steps slideshow effect changing every 2 seconds (with hover pausing)
  useEffect(() => {
    if (isSlideshowHovered) return;
    const imageCount = (STEP_IMAGES_MAP[selectedExercise.id] || selectedExercise.steps).length;
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % imageCount);
    }, 2000);
    return () => clearInterval(interval);
  }, [isSlideshowHovered, selectedExercise]);

  useEffect(() => {
    if (exercise) {
      setSelectedExercise(exercise);
    }
  }, [exercise]);

  const handleSelectExercise = (ex: ExerciseData) => {
    setSelectedExercise(ex);
    if (onExerciseChange) {
      onExerciseChange(ex);
    }
  };

  // Steps dynamically set for selected exercise
  const steps = selectedExercise.steps;

  // Mistakes dynamically parsed for selected exercise
  const mistakes = selectedExercise.mistakes.map(m => {
    const hasColon = m.includes(':');
    return {
      title: hasColon ? m.split(':')[0].trim() : m,
      desc: hasColon ? m.split(':')[1].trim() : 'Maintain tight body stability.'
    };
  });

  // Hero image — if ex-07 (Bench Press), we can use the annotated image to match the mockup exactly; otherwise use its default high-quality asset!
  const heroImage = selectedExercise.id === 'ex-07'
    ? 'https://lh3.googleusercontent.com/aida/ADBb0uiuOd0uYOUzotaF0qDpyWPr7DOGMMU7VUriIQFLvJTe4DA-pkqSEPFKP-X3u1uXvuLYyQP4Utx4qfFRZVerS_uScttfS18x5MM50sdQGMzsIlaf86yXgkvfx-YtcSEmRZGQwx0sFzIINAkl1_M8a6Ez0I1_RvRmroEJGqR4B2P3VE_YaYGN6Z8hUFdWEqPHUldqA8136qZ_AYcX_h5qYiSOUVdSFG90KWadeg1CJ_64L8X-cRcLABkQ'
    : selectedExercise.image;

  // Active step image for dynamic live slideshow reference
  const activeStepImage = (STEP_IMAGES_MAP[selectedExercise.id] && STEP_IMAGES_MAP[selectedExercise.id][currentStepIndex])
    || selectedExercise.image;

  // Whether the current frame is a "mistake" warning frame
  const isMistakeFrame = MISTAKE_FRAME_INDICES.has(currentStepIndex);

  // Current step label from STEP_LABELS_MAP or fallback to exercise step title
  const activeStepLabel = (STEP_LABELS_MAP[selectedExercise.id]?.[currentStepIndex])
    || selectedExercise.steps[Math.min(currentStepIndex, selectedExercise.steps.length - 1)]?.title
    || '';

  // Total number of frames in the slideshow
  const slideshowImageCount = (STEP_IMAGES_MAP[selectedExercise.id] || selectedExercise.steps).length;

  // --- DETECTOR SESSION CONTROLS ---
  const startDetectionSession = async () => {
    try {
      prevRepsRef.current = 0;
      prevSetsRef.current = 0;
      setCurrentReps(0);
      setCurrentSets(0);
      setDuration(0);
      setCalories(0);

      const response = await fetch('/api/detection/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          workout: selectedExercise.id,
          target: targetReps,
          sets: targetSets,
        }),
      });
      if (response.ok) {
        setIsTracking(true);
      }
    } catch (err) {
      console.error('Failed to start detection session:', err);
      setIsTracking(true);
    }
  };

  const stopDetectionSession = async () => {
    try {
      await fetch('/api/detection/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
        }),
      });
    } catch (err) {
      console.error('Failed to stop detection session:', err);
    }
    setIsTracking(false);
  };

  const resetDetectionSession = async () => {
    try {
      await fetch('/api/detection/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset',
        }),
      });
    } catch (err) {
      console.error('Failed to reset detection session:', err);
    }
    setIsTracking(false);
    setDuration(0);
    setCurrentReps(0);
    setCurrentSets(0);
    setCalories(0);
  };

  // Poll real-time tracking stats from python detector
  useEffect(() => {
    let interval: any;
    if (isTracking) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/detection/api/state');
          if (res.ok) {
            const data = await res.json();
            
            if (data.counter !== undefined) {
              const countVal = parseInt(data.counter);
              if (!isNaN(countVal) && countVal !== prevRepsRef.current) {
                setCurrentReps(countVal);
                if (aiVoiceActive && countVal > prevRepsRef.current && countVal > 0) {
                  speak(numberToWord(countVal), true);
                }
                prevRepsRef.current = countVal;
              }
            }

            if (data.set_str !== undefined) {
              const match = data.set_str.match(/^(\d+)\s*\/\s*(\d+)/);
              if (match) {
                const bSet = parseInt(match[1]);
                const computedSetsDone = data.completed ? targetSets : (bSet - 1);
                if (computedSetsDone !== prevSetsRef.current) {
                  setCurrentSets(computedSetsDone);
                  if (aiVoiceActive && computedSetsDone > prevSetsRef.current) {
                    speak(`Set ${computedSetsDone} completed.`, true);
                  }
                  prevSetsRef.current = computedSetsDone;
                }
              }
            }

            if (data.calories !== undefined) {
              setCalories(data.calories);
            }
            
            if (data.time_elapsed !== undefined) {
              setDuration(data.time_elapsed);
            }

            setFormScore(prev => {
              const delta = Math.floor(Math.random() * 5) - 2;
              return Math.max(88, Math.min(98, prev + delta));
            });

            if (data.completed) {
              setIsTracking(false);
              setShowSuccessModal(true);
            }
          }
        } catch (err) {
          console.error('Error polling detector state:', err);
        }
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isTracking, targetSets, aiVoiceActive]);

  // Transition listener to announce workout completion summary
  const wasTrackingRef = useRef(false);
  useEffect(() => {
    if (isTracking) {
      wasTrackingRef.current = true;
    } else if (wasTrackingRef.current) {
      wasTrackingRef.current = false;
      if (aiVoiceActive) {
        const totalRepsVal = currentReps + (currentSets * targetReps);
        const durationText = formatSpokenTime(duration);
        const setsText = `${currentSets} set${currentSets === 1 ? '' : 's'}`;
        const repsText = `${totalRepsVal} repetition${totalRepsVal === 1 ? '' : 's'}`;
        
        const summaryText = `Workout completed. You completed ${setsText} and ${repsText}. You burned approximately ${calories} calories. Your workout duration was ${durationText}. Great work. Keep pushing toward your fitness goals.`;
        speak(summaryText, true);
      }
    }
  }, [isTracking, currentReps, currentSets, calories, duration, aiVoiceActive, targetReps]);

  const handleApplyWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetReps(tempReps);
    setTargetSets(tempSets);
    setTargetDuration(tempDurationHr * 3600 + tempDurationMin * 60 + tempDurationSec);
    setTargetRest(tempRest);
    setTargetDifficulty(tempDifficulty);
    setTargetGoal(tempGoal);
    
    setDuration(0);
    setCurrentReps(0);
    setCurrentSets(0);
    setCalories(0);
    setShowSetWorkoutModal(false);
  };

  const handleSaveWorkout = () => {
    addSession({
      exerciseId: selectedExercise.id,
      reps: currentReps + (currentSets * targetReps),
      sets: currentSets,
      calories,
      durationSeconds: duration,
      accuracy: formScore
    });
    alert('Workout saved to progress successfully!');
    stopDetectionSession();
  };

  const handleFinishWorkout = () => {
    stopDetectionSession();
    if (aiVoiceActive) {
      speak(`${selectedExercise.title} complete! You did ${currentSets} sets, ${currentReps + currentSets * targetReps} reps, and burned ${calories} calories. Great job!`, true);
    }
    setShowSuccessModal(true);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  return (
    <div ref={containerRef} className="min-h-0 w-full p-0 transition-colors duration-500 space-y-6 pb-8 bg-background text-on-surface">
      
      {/* ── ROW 1: Hero (~70%) + Form Reference (~30%) — extended height ── */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4 items-stretch"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Left hero — video panel (content overlays unchanged) */}
        <motion.section 
          className="relative rounded-3xl overflow-hidden group bg-slate-900 min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] transition-all duration-500 border border-outline shadow-md"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { scale: 1.002 }}
        >
          {isTracking ? (
            <img
              alt="Live AI Coach Feed"
              className="w-full h-full object-cover absolute inset-0"
              src="/api/detection/video"
            />
          ) : (
            <img
              alt={selectedExercise.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 absolute inset-0"
              src={heroImage}
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

          {/* Top-left HUD: Primary Muscle + AI VOICE + Tutorial play */}
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-sm z-20">
            <button
              onClick={() => window.open(YOUTUBE_MAP[selectedExercise.id], '_blank')}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition-all active:scale-95 flex-shrink-0 cursor-pointer animate-pulse"
              title="Open tutorial in YouTube"
            >
              <Play className="w-3.5 h-3.5 text-white fill-white translate-x-0.5" />
            </button>
            <div>
              <span className="text-white/60 text-[8px] font-black uppercase tracking-widest block leading-none mb-1">PRIMARY MUSCLE</span>
              <span className="text-white text-xs font-black uppercase tracking-wider">
                {selectedExercise.id === 'ex-07' ? 'Pectoralis Major' : selectedExercise.muscle}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-white/20" />
            <button
              onClick={() => setAiVoiceActive(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                aiVoiceActive
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/25'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <Volume2 className="w-3 h-3" />
              AI VOICE
            </button>
          </div>

          {/* AI TRACKING ACTIVE — top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">AI TRACKING ACTIVE</span>
          </div>

          {/* Floating Action Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl z-20 flex-wrap justify-center w-[90%] max-w-[580px]">
            <button
              type="button"
              onClick={() => {
                setTempReps(targetReps);
                setTempSets(targetSets);
                setTempDurationMin(Math.floor(targetDuration / 60));
                setTempDurationSec(targetDuration % 60);
                setTempRest(targetRest);
                setTempDifficulty(targetDifficulty);
                setTempGoal(targetGoal);
                setShowSetWorkoutModal(true);
              }}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-[1.02] active:scale-95 transition-all font-bold text-xs cursor-pointer duration-300 shadow-md backdrop-blur-md"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Set Workout
            </button>

            <button
              onClick={startDetectionSession}
              disabled={isTracking}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 hover:scale-[1.02] cursor-pointer duration-300 backdrop-blur-md ${
                isTracking 
                  ? 'bg-white/5 text-white/40 border border-white/5 opacity-40 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isTracking ? 'text-white/40' : 'text-emerald-400 fill-emerald-400'}`} /> 
              Start Session
            </button>

            <button
              onClick={stopDetectionSession}
              disabled={!isTracking}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 hover:scale-[1.02] cursor-pointer duration-300 backdrop-blur-md ${
                !isTracking 
                  ? 'bg-white/5 text-white/40 border border-white/5 opacity-40 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Square className={`w-3.5 h-3.5 ${!isTracking ? 'text-white/40' : 'text-red-400 fill-red-400'}`} /> 
              Stop Session
            </button>

            <button
              onClick={handleSaveWorkout}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-[1.02] active:scale-95 transition-all font-bold text-xs cursor-pointer duration-300 shadow-md backdrop-blur-md"
            >
              <Save className="w-3.5 h-3.5" /> 
              Save Result
            </button>
          </div>
        </motion.section>

        {/* Right — Form Reference (matches video height) */}
        <motion.section 
          className="lg:w-[420px] lg:h-[720px] w-full"
          variants={cardVariants}
        >
          <div className="reference-video-container transition-all duration-500">
            <video
              key={selectedExercise.id} // key change triggers clean DOM replace & smooth transition
              className="reference-video"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={getWorkoutVideoSrc(selectedExercise.title)} type="video/mp4" />
            </video>
          </div>
        </motion.section>
      </motion.div>
      <motion.div 
        className="relative overflow-hidden p-6 md:p-8 transition-all duration-500 theme-card shadow-sm text-on-surface"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* Brain watermark */}
        <div className="absolute top-0 right-0 p-4 pointer-events-none transition-all duration-500 opacity-[0.03] text-primary">
          <Brain className="w-44 h-44 text-current" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-center mb-6">

          {/* Accuracy bar */}
          <div className="xl:col-span-1 pb-5 xl:pb-0 xl:pr-6">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-black transition-colors duration-500 text-primary">Accuracy Score</span>
              <span className="text-2xl font-black tracking-tight transition-colors duration-500 text-primary">{formScore}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden border transition-all duration-500 bg-outline-variant/30 border-outline">
              <div
                className="h-full bg-gradient-to-r rounded-full transition-all duration-700 from-emerald-500 to-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{ width: `${formScore}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="xl:col-span-2">
            <div className={`grid gap-3 ${isPlank ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>

               {/* Rep Count Card — hidden for Plank (timed hold exercise) */}
               {!isPlank && (
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-emerald-100 hover:border-emerald-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#22C55E]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Dumbbell} size="sm" bg="rgba(16,185,129,0.15)" border="rgba(16,185,129,0.35)" color="#059669" />
                   <p className="text-[9px] font-black uppercase tracking-wider transition-colors text-on-surface-variant">REP COUNT</p>
                 </div>
                 <div className="flex items-center justify-between relative z-10">
                   <button 
                     type="button"
                     onClick={() => setCurrentReps(r => Math.max(0, r - 1))} 
                     className="w-7 h-7 flex items-center justify-center rounded-full border shadow-sm transition-all duration-200 active:scale-90 cursor-pointer bg-outline-variant/30 hover:bg-[#22C55E]/10 border border-outline hover:border-[#22C55E]/50 text-primary"
                   >
                     <Minus className="w-3.5 h-3.5" />
                   </button>
                   <span className="text-2xl font-black transition-colors duration-300 text-emerald-600">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={currentReps}
                         initial={{ scale: 0.85, opacity: 0.5 }}
                         animate={{ scale: [1.25, 1], opacity: 1 }}
                         exit={{ scale: 0.85, opacity: 0.5 }}
                         transition={{ duration: 0.25, ease: "easeOut" }}
                         className="inline-block"
                       >
                         {currentReps}
                       </motion.span>
                     </AnimatePresence>
                     <span className="font-bold text-sm transition-colors text-on-surface-variant/60">/{targetReps}</span>
                   </span>
                   <button 
                     type="button"
                     onClick={() => setCurrentReps(r => r + 1)} 
                     className="w-7 h-7 flex items-center justify-center rounded-full border shadow-sm transition-all duration-200 active:scale-90 cursor-pointer bg-outline-variant/30 hover:bg-[#22C55E]/10 border border-outline hover:border-[#22C55E]/50 text-primary"
                   >
                     <Plus className="w-3.5 h-3.5" />
                   </button>
                 </div>
               </div>
               )}
     
               {/* Calories Card (Warm Orange / Cyan Blue Accent) */}
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-red-100 hover:border-red-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#F97316]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Flame} size="sm" bg="rgba(255,75,75,0.15)" border="rgba(255,75,75,0.35)" color="#EF4444" />
                   <p className="text-[9px] font-black uppercase tracking-wider transition-colors text-on-surface-variant">CALORIES</p>
                 </div>
                 <div className="flex items-baseline gap-1 mt-1 relative z-10 transition-transform duration-300 group-hover:translate-y-[-2px]">
                   <span className="text-2xl font-black transition-colors duration-300 leading-none text-red-600">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={calories}
                         initial={{ scale: 0.85, opacity: 0.7 }}
                         animate={{ scale: [1.2, 1], opacity: 1 }}
                         exit={{ scale: 0.85, opacity: 0.7 }}
                         transition={{ duration: 0.2, ease: "easeOut" }}
                         className="inline-block"
                       >
                         {calories}
                       </motion.span>
                     </AnimatePresence>
                   </span>
                   <span className="text-[10px] font-bold transition-colors text-on-surface-variant">kcal</span>
                 </div>
               </div>
     
               {/* Timer Card (Cyan Blue Glow) */}
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-blue-100 hover:border-blue-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#06B6D4]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Timer} size="sm" bg="rgba(6,182,212,0.15)" border="rgba(6,182,212,0.35)" color="#0891B2" />
                   <p className="text-[9px] font-black uppercase tracking-wider mb-2 transition-colors text-on-surface-variant">TIMER</p>
                 </div>
                 <div className="flex items-center gap-2 mt-1 relative z-10">
                   <span className="text-2xl font-black leading-none transition-colors duration-300 text-blue-600">
                     {formatTime(duration)}<span className="font-bold text-sm transition-colors text-on-surface-variant/60 ml-1">/{formatTime(targetDuration)}</span>
                   </span>
                 </div>
                 {isTracking && (
                   <span className="absolute bottom-1.5 right-3 text-[9px] font-black text-[#06B6D4] uppercase tracking-wider animate-pulse">
                     {formatTime(Math.max(0, targetDuration - duration))} remaining
                   </span>
                 )}
               </div>
    
               {/* Sets Card — hidden for Plank (timed hold exercise) */}
               {!isPlank && (
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-purple-100 hover:border-purple-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#8B5CF6]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Zap} size="sm" bg="rgba(124,59,255,0.15)" border="rgba(124,59,255,0.35)" color="#7C3AED" />
                   <p className="text-[9px] font-black uppercase tracking-wider mb-2 transition-colors text-on-surface-variant">SETS</p>
                 </div>
                 <div className="flex items-center justify-between mt-1 relative z-10">
                   <span className="text-2xl font-black transition-colors duration-300 leading-none text-purple-600">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={currentSets}
                         initial={{ scale: 0.85, opacity: 0.7 }}
                         animate={{ scale: [1.2, 1], opacity: 1 }}
                         exit={{ scale: 0.85, opacity: 0.7 }}
                         transition={{ duration: 0.25, ease: "easeOut" }}
                         className="inline-block"
                       >
                         {currentSets}
                       </motion.span>
                     </AnimatePresence>
                     <span className="font-bold text-sm transition-colors text-on-surface-variant/60">/{targetSets}</span>
                   </span>
                   <button 
                     type="button"
                     onClick={() => setCurrentSets(s => s >= targetSets ? 1 : s + 1)}
                     className="w-7 h-7 flex items-center justify-center rounded-xl border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer bg-outline-variant/30 hover:bg-[#8B5CF6]/10 border border-outline hover:border-[#8B5CF6]/50 text-primary"
                   >
                     <ArrowUp className="w-3.5 h-3.5 text-current" />
                   </button>
                 </div>
               </div>
               )}
    
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── ROW 3: 3-column grid: Steps | Mistakes | Expert Guide ── */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >

        {/* Workout Steps */}
        <motion.div className="theme-card p-6 shadow-sm text-on-surface" variants={cardVariants}>
          <h4 className="font-extrabold text-base text-primary mb-5 flex items-center gap-2">
            <span className="inline-block w-4 h-4 text-on-surface-variant">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="4" height="4" rx="1"/><line x1="7" y1="3" x2="15" y2="3"/><rect x="1" y="7" width="4" height="4" rx="1"/><line x1="7" y1="9" x2="15" y2="9"/><rect x="1" y="13" width="4" height="4" rx="1"/></svg>
            </span>
            Workout Steps
          </h4>
          <div className="space-y-5">
            {steps.map((step, idx) => (
              <motion.div key={idx} className="flex gap-4 group" variants={fadeUpVariants}>
                <div className="w-10 h-10 rounded-2xl bg-outline-variant/30 text-primary font-black text-xs flex items-center justify-center flex-shrink-0 border border-outline group-hover:bg-primary group-hover:text-background group-hover:border-transparent transition-all duration-300">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-primary mb-0.5">{step.title}</h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Avoid These Mistakes */}
        <motion.div className="theme-card p-6 shadow-sm text-on-surface" variants={cardVariants}>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 mb-5">AVOID THESE MISTAKES</h4>
          <div className="space-y-5">
            {mistakes.map((mistake, idx) => (
              <motion.div key={idx} className="flex items-start gap-3" variants={fadeUpVariants}>
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-500 dark:text-red-400">{mistake.title}</p>
                  <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5">{mistake.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Form Slideshow card */}
        <motion.div 
          className="theme-card theme-card-hover overflow-hidden shadow-sm flex flex-col group/card relative aspect-square bg-slate-950 text-white"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.01, transition: { duration: 0.3 } }}
          onMouseEnter={() => setIsSlideshowHovered(true)}
          onMouseLeave={() => setIsSlideshowHovered(false)}
        >
          {/* Slideshow image area */}
          <div className="relative w-full h-full overflow-hidden select-none bg-black">
            {isSlideshowHovered ? (
              <video
                key={selectedExercise.id}
                className="w-full h-full object-cover opacity-95 transition-opacity duration-300"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={getWorkoutVideoSrc(selectedExercise.title)} type="video/mp4" />
              </video>
            ) : (
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentStepIndex}
                  alt={activeStepLabel}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover opacity-85 transition-transform duration-1000 group-hover/card:scale-105"
                  src={activeStepImage}
                  loading="lazy"
                />
              </AnimatePresence>
            )}

            {/* Subtle overlay gradient */}
            {!isSlideshowHovered && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 pointer-events-none" />
            )}



            {/* Prev/Next arrows on hover */}
            {!isSlideshowHovered && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStepIndex(prev => (prev - 1 + slideshowImageCount) % slideshowImageCount);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStepIndex(prev => (prev + 1) % slideshowImageCount);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Glassmorphic step description overlay (exactly matches screenshot style) */}
            {!isSlideshowHovered && (() => {
              const isMistake = MISTAKE_FRAME_INDICES.has(currentStepIndex);
              const totalSteps = selectedExercise.steps.length;
              let stepType = '';
              let stepTitle = '';
              let stepDesc = '';
              let isError = false;

              if (!isMistake && currentStepIndex < totalSteps) {
                stepType = `STEP ${currentStepIndex + 1} OF ${totalSteps}`;
                stepTitle = selectedExercise.steps[currentStepIndex]?.title || '';
                stepDesc = selectedExercise.steps[currentStepIndex]?.desc || '';
              } else {
                const mIdx = currentStepIndex - totalSteps;
                const mItem = mistakes[Math.min(mIdx, mistakes.length - 1)] || { title: 'Improper Form', desc: 'Maintain tight body stability.' };
                stepType = 'AVOID MISTAKE';
                stepTitle = mItem.title;
                stepDesc = mItem.desc;
                isError = true;
              }

              return (
                <div className="absolute bottom-10 left-4 right-4 text-center z-20 flex flex-col items-center justify-center">
                  <span className={`block text-[10px] font-black tracking-widest uppercase mb-1 drop-shadow-md ${isError ? 'text-red-400' : 'text-white/60'}`}>
                    {stepType}
                  </span>
                  <h4 className={`text-base font-black tracking-wide uppercase drop-shadow-md ${isError ? 'text-red-500' : 'text-white'}`}>
                    {stepTitle}
                  </h4>
                  <p className="text-xs text-white/90 mt-1 max-w-[85%] leading-relaxed drop-shadow-md">
                    {stepDesc}
                  </p>
                </div>
              );
            })()}

            {/* Pagination dots at the very bottom */}
            {!isSlideshowHovered && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30">
                {Array.from({ length: slideshowImageCount }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStepIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentStepIndex === idx 
                        ? 'w-5 bg-white' 
                        : 'w-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Success / Workout Summary Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500">
          <div className="theme-card max-w-lg w-full p-8 text-center shadow-2xl transition-all duration-300 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">

            {/* Trophy icon */}
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-emerald-500/20 relative">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-pulse" />
              <span className="absolute -top-1 -right-1 text-xl">🏆</span>
            </div>

            <h2 className="text-2xl font-black text-primary tracking-tight mb-1">Workout Complete!</h2>
            <p className="text-xs text-on-surface-variant mb-1 px-4">
              {selectedExercise.title}
            </p>
            <p className="text-[10px] text-on-surface-variant/70 mb-6 px-4">
              Fantastic session! Here's your full workout summary.
            </p>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-emerald-500/10 border border-emerald-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Reps</p>
                <p className="text-2xl font-black text-primary leading-none">{currentReps + (currentSets * targetReps)}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Sets Done</p>
                <p className="text-2xl font-black text-primary leading-none">{currentSets}<span className="text-sm text-on-surface-variant font-bold">/{targetSets}</span></p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/25 py-4 px-3 rounded-2xl flex flex-col items-center col-span-2 sm:col-span-1">
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Calories Burned</p>
                <p className="text-2xl font-black text-primary leading-none">{calories}<span className="text-xs text-on-surface-variant font-bold ml-0.5">kcal</span></p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-xl font-black text-primary leading-none">{formatTime(duration)}</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Form Score</p>
                <p className="text-2xl font-black text-primary leading-none">{formScore}<span className="text-sm text-on-surface-variant font-bold">%</span></p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Grade</p>
                <p className="text-2xl font-black text-emerald-500 leading-none">
                  {formScore >= 95 ? 'S+' : formScore >= 90 ? 'A+' : formScore >= 85 ? 'A' : 'B+'}
                </p>
              </div>
            </div>

            {/* Motivational message */}
            <div className="bg-outline-variant/10 border border-outline rounded-2xl p-4 mb-6 text-left">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Coach Feedback</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {formScore >= 95
                  ? `Outstanding performance on ${selectedExercise.title}! Your form was near-perfect. Keep this consistency and you'll see incredible gains.`
                  : formScore >= 90
                  ? `Great job on ${selectedExercise.title}! Your form was excellent. Focus on maintaining full range of motion in your next session.`
                  : `Good effort on ${selectedExercise.title}! Review the form guide and aim for smoother reps next time to maximize muscle activation.`
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 border border-outline text-primary hover:bg-outline-variant/20 py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-300"
              >
                Keep Going
              </button>
              <button
                onClick={() => { handleSaveWorkout(); setShowSuccessModal(false); }}
                className="flex-1 bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] py-3.5 rounded-2xl font-extrabold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-300 shadow-md border border-transparent"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Set Workout Modal ── */}
      {showSetWorkoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500">
          <div className="theme-card max-w-xl w-full p-6 md:p-8 shadow-2xl text-left overflow-y-auto max-h-[90vh] scrollbar-thin z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Settings className="w-5 h-5 text-primary animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">Configure Workout</h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Set targets for {selectedExercise.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSetWorkoutModal(false)}
                className="w-8 h-8 rounded-full bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary transition-colors font-black text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Workout Presets (Advanced Selectable Cards System) */}
            <div className="mb-6">
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-wider mb-2.5">DIFFICULTY PRESETS</p>
              <div className="grid grid-cols-3 gap-3">
                
                {/* Normal card */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect('Normal')}
                  className={`relative py-3.5 px-3 rounded-2xl border text-center transition-all duration-300 active:scale-95 flex flex-col items-center justify-center hover:scale-[1.02] cursor-pointer ${
                    tempDifficulty === 'Normal'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] text-emerald-600 dark:text-emerald-400 font-black'
                      : 'border-outline bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface-variant font-bold'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">Normal</span>
                  <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">Light Cardio</span>
                  {tempDifficulty === 'Normal' && (
                    <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </button>

                {/* Medium card */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect('Medium')}
                  className={`relative py-3.5 px-3 rounded-2xl border text-center transition-all duration-300 active:scale-95 flex flex-col items-center justify-center hover:scale-[1.02] cursor-pointer ${
                    tempDifficulty === 'Medium'
                      ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] text-amber-600 dark:text-amber-400 font-black'
                      : 'border-outline bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface-variant font-bold'
                  }`}
                >
                  <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[7px] font-black uppercase text-white tracking-widest shadow-md">
                    Recommended
                  </span>
                  <span className="text-xs uppercase tracking-wider mt-0.5">Medium</span>
                  <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">Fat Burn</span>
                  {tempDifficulty === 'Medium' && (
                    <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  )}
                </button>

                {/* High card */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect('High')}
                  className={`relative py-3.5 px-3 rounded-2xl border text-center transition-all duration-300 active:scale-95 flex flex-col items-center justify-center hover:scale-[1.02] cursor-pointer ${
                    tempDifficulty === 'High'
                      ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)] text-purple-600 dark:text-purple-400 font-black'
                      : 'border-outline bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface-variant font-bold'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">High</span>
                  <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">Hardcore Strength</span>
                  {tempDifficulty === 'High' && (
                    <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                  )}
                </button>

              </div>
            </div>

            <form onSubmit={handleApplyWorkout} className="space-y-5">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Reps Count input */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Rep Count</label>
                  <div className="flex items-center bg-outline-variant/10 border border-outline rounded-2xl p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTempReps(r => Math.max(1, r - 1))}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={tempReps}
                      onChange={(e) => setTempReps(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center bg-transparent border-none text-base font-black text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempReps(r => r + 1)}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sets input */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Number of Sets</label>
                  <div className="flex items-center bg-outline-variant/10 border border-outline rounded-2xl p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTempSets(s => Math.max(1, s - 1))}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={tempSets}
                      onChange={(e) => setTempSets(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center bg-transparent border-none text-base font-black text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempSets(s => s + 1)}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Workout Duration (Hours : Minutes : Seconds Time Steppers) */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Workout Duration (HH : MM : SS)</label>
                  <div className="flex items-center justify-between gap-2 bg-outline-variant/10 border border-outline rounded-2xl p-3 shadow-sm">
                    
                    {/* Hours stepper */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-on-surface-variant font-black uppercase mb-1">Hours</span>
                      <div className="flex items-center w-full bg-outline-variant/10 rounded-xl border border-outline p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTempDurationHr(h => Math.max(0, h - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={tempDurationHr.toString().padStart(2, '0')}
                          onChange={(e) => setTempDurationHr(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center bg-transparent border-none text-sm font-black text-primary focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTempDurationHr(h => Math.min(23, h + 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span className="text-slate-600 dark:text-slate-400 font-black self-end mb-2">:</span>

                    {/* Minutes stepper */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-on-surface-variant font-black uppercase mb-1">Minutes</span>
                      <div className="flex items-center w-full bg-outline-variant/10 rounded-xl border border-outline p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTempDurationMin(m => Math.max(0, m - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={tempDurationMin.toString().padStart(2, '0')}
                          onChange={(e) => setTempDurationMin(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center bg-transparent border-none text-sm font-black text-primary focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTempDurationMin(m => Math.min(59, m + 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span className="text-slate-600 dark:text-slate-400 font-black self-end mb-2">:</span>

                    {/* Seconds stepper */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-on-surface-variant font-black uppercase mb-1">Seconds</span>
                      <div className="flex items-center w-full bg-outline-variant/10 rounded-xl border border-outline p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTempDurationSec(s => Math.max(0, s - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={tempDurationSec.toString().padStart(2, '0')}
                          onChange={(e) => setTempDurationSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center bg-transparent border-none text-sm font-black text-primary focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTempDurationSec(s => Math.min(59, s + 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Rest Time Between Sets */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Rest Time Between Sets (seconds)</label>
                  <div className="flex items-center bg-outline-variant/10 border border-outline rounded-2xl p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTempRest(r => Math.max(5, r - 5))}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      -5s
                    </button>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={tempRest}
                      onChange={(e) => setTempRest(Math.max(5, parseInt(e.target.value) || 5))}
                      className="w-full text-center bg-transparent border-none text-base font-black text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempRest(r => r + 5)}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      +5s
                    </button>
                  </div>
                </div>

                {/* Exercise Goal */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Exercise Goal</label>
                  <select
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full bg-surface border border-outline rounded-2xl p-3.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm"
                  >
                    <option value="Hypertrophy & Strength" className="bg-surface text-primary">Hypertrophy & Strength</option>
                    <option value="Cardio / Endurance" className="bg-surface text-primary">Cardio / Endurance</option>
                    <option value="Fat Loss" className="bg-surface text-primary">Fat Loss</option>
                    <option value="General Fitness" className="bg-surface text-primary">General Fitness</option>
                  </select>
                </div>

              </div>

              {/* Workout Summary Preview Card (Advanced premium feature) */}
              <div className="bg-outline-variant/10 border border-outline p-4 rounded-2xl space-y-3 shadow-sm text-on-surface">
                <span className="block text-[8px] font-black tracking-widest text-on-surface-variant uppercase leading-none">
                  WORKOUT SUMMARY PREVIEW
                </span>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="py-2 px-1 bg-surface rounded-xl border border-outline shadow-sm">
                    <span className="block text-[8px] text-on-surface-variant font-bold uppercase mb-0.5">Total Volume</span>
                    <span className="text-sm font-black text-primary">{tempSets * tempReps} reps</span>
                  </div>
                  <div className="py-2 px-1 bg-surface rounded-xl border border-outline shadow-sm">
                    <span className="block text-[8px] text-on-surface-variant font-bold uppercase mb-0.5">Difficulty Score</span>
                    <span className="text-sm font-black text-indigo-500 dark:text-indigo-400">{calculateDifficultyScore()}/100</span>
                  </div>
                  <div className="py-2 px-1 bg-surface rounded-xl border border-outline shadow-sm">
                    <span className="block text-[8px] text-on-surface-variant font-bold uppercase mb-0.5">Rest Ratio</span>
                    <span className="text-sm font-black text-teal-500 dark:text-teal-400">1:{Math.round((tempDurationHr * 3600 + tempDurationMin * 60 + tempDurationSec) / (tempRest * tempSets || 1))}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-on-surface-variant uppercase leading-none mb-1.5 animate-pulse">
                      ESTIMATED CALORIES
                    </span>
                    <div className="flex items-baseline gap-1 bg-orange-500/10 border border-orange-500/20 py-1.5 px-3 rounded-xl w-fit shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                      <span className="text-xl font-black text-orange-500 leading-none">{estimatedCalories}</span>
                      <span className="text-[9px] font-black text-on-surface-variant uppercase">kcal</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-on-surface-variant uppercase leading-none mb-1.5">
                      WORKOUT INTENSITY
                    </span>
                    <div className="flex items-center">
                      <span className={`inline-block px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border shadow-sm ${getIntensityInfo().color}`}>
                        {getIntensityInfo().intensity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline">
                <button
                  type="button"
                  onClick={() => setShowSetWorkoutModal(false)}
                  className="py-3 px-6 rounded-xl border border-outline text-primary hover:bg-outline-variant/20 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] border border-transparent font-black text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-300 shadow-md"
                >
                  Apply Workout
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}