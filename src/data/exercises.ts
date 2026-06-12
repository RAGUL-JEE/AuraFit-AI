import { ExerciseData } from '../types';

export const EXERCISES: ExerciseData[] = [
  { 
    id: 'ex-01', 
    title: 'Push-Up', 
    muscle: 'Chest & Triceps', 
    image: '/images/workouts/push_up.png',
    steps: [
      { title: 'Hand Placement', desc: 'Place your hands slightly wider than shoulder-width.' },
      { title: 'Body Alignment', desc: 'Keep your body in a straight line from head to heels.' },
      { title: 'Core Tension', desc: 'Tighten your core and glutes.' },
      { title: 'Full Drive', desc: 'Push back up fully without locking elbows.' }
    ],
    mistakes: [
      'Hips sagging down: May lead to lower back strain.',
      'Elbows flaring too wide: Puts excess stress on the shoulders.',
      'Half reps: Reduces chest and arm muscle fiber activation.',
      'Neck looking upward: Disrupts spine alignment.',
      'Holding breath: Restricts oxygen supply to the muscles.',
      'Fast uncontrolled movement: Increases risk of elbow joint injury.',
      'Incomplete lockout: Minimizes triceps load contraction.'
    ]
  },
  { 
    id: 'ex-02', 
    title: 'Squat', 
    muscle: 'Quadriceps & Glutes', 
    image: '/images/workouts/squat.png',
    steps: [
      { title: 'Stance Setup', desc: 'Stand with feet shoulder-width apart.' },
      { title: 'Core Activation', desc: 'Brace your core.' },
      { title: 'Knee Flexion', desc: 'Bend knees and lower down.' },
      { title: 'Heel Drive', desc: 'Drive through heels to stand up.' }
    ],
    mistakes: [
      'Knees collapsing inward: Puts extreme stress on ACL ligaments.',
      'Heels lifting off floor: Shifts the direct load onto the knee cap.',
      'Rounded back: Increases risk of lower back disc injuries.',
      'Looking down: Leads to bad hip and chest positioning.',
      'Shallow squats: Cuts off full glute and quad loading benefits.',
      'Leaning too far forward: Places undue strain on spinal extensors.',
      'Using momentum: Diminishes overall quad force requirements.'
    ]
  },
  { 
    id: 'ex-03', 
    title: 'Lunge', 
    muscle: 'Quadriceps & Hamstrings', 
    image: '/images/workouts/lunge.png',
    steps: [
      { title: 'Starting Posture', desc: 'Stand tall with feet together.' },
      { title: 'Step Forward', desc: 'Step one leg forward.' },
      { title: 'Double Flexion', desc: 'Lower both knees slowly.' },
      { title: 'Ankle Track', desc: 'Front knee stays directly above ankle.' },
      { title: 'Upright Spine', desc: 'Keep upper body upright.' },
      { title: 'Heel Push', desc: 'Push through front heel.' },
      { title: 'Step Back', desc: 'Return to starting position.' }
    ],
    mistakes: [
      'Front knee crossing toes: Puts extreme shear force on the kneecap.',
      'Leaning forward: Reduces direct load target on the quads.',
      'Small step length: Crowds leg space and increases joint pressure.',
      'Back knee slamming floor: Can cause deep patella bruising.',
      'Unstable balance: Decreases efficiency and target loading.',
      'Looking downward: Forces the chest to collapse forward.',
      'Not engaging core: Minimizes pelvic and spinal stability.'
    ]
  },
  { 
    id: 'ex-04', 
    title: 'Plank', 
    muscle: 'Core', 
    image: '/images/workouts/plank.png',
    steps: [
      { title: 'Forearm Setup', desc: 'Place forearms on the floor.' },
      { title: 'Elbow Alignment', desc: 'Keep elbows below shoulders.' },
      { title: 'Leg Extension', desc: 'Extend legs behind you.' },
      { title: 'Body Line', desc: 'Maintain straight body alignment.' },
      { title: 'Brace Midsection', desc: 'Tighten abs and glutes.' },
      { title: 'Neutral Neck', desc: 'Keep neck neutral.' },
      { title: 'Steady Breath', desc: 'Hold position while breathing steadily.' }
    ],
    mistakes: [
      'Hips too high: Transfers work away from deep core abdominal wall.',
      'Hips sagging low: Overloads the lumbar spine dangerously.',
      'Holding breath: Elevates blood pressure and strains thoracic area.',
      'Looking forward excessively: Creates unnecessary cervical neck fatigue.',
      'Loose core: Destroys targeted structural core benefits.',
      'Bent knees: Fails to recruit the quads and lower chain.',
      'Short hold duration: Fails to build deep muscle endurance.'
    ]
  },
  { 
    id: 'ex-05', 
    title: 'Bicep Curl', 
    muscle: 'Biceps', 
    image: '/images/workouts/bicep_curl.png',
    steps: [
      { title: 'Grip & Stance', desc: 'Hold dumbbells at your sides.' },
      { title: 'Pin Elbows', desc: 'Keep elbows close to body.' },
      { title: 'Posture Check', desc: 'Stand with straight posture.' },
      { title: 'Slow Contraction', desc: 'Curl weights upward slowly.' },
      { title: 'Top Squeeze', desc: 'Squeeze biceps at the top.' },
      { title: 'Negative Control', desc: 'Lower weights with control.' },
      { title: 'Zero Swing', desc: 'Repeat without swinging.' }
    ],
    mistakes: [
      'Swinging the body: Shifts work to momentum and spinal joints.',
      'Moving elbows forward: Over-recruits anterior shoulder deltoids.',
      'Using heavy weight: Sacrifices range of motion and form safety.',
      'Partial reps: Misses full bicep stretch and peak contraction.',
      'Fast lowering: Destroys key eccentric muscle damage potential.',
      'Rounded shoulders: Ruins proper shoulder positioning.',
      'Wrist bending: Puts excessive strain on forearms.'
    ]
  },
  { 
    id: 'ex-06', 
    title: 'Shoulder Press', 
    muscle: 'Shoulders', 
    image: '/images/workouts/shoulder_press.png',
    steps: [
      { title: 'Height Setup', desc: 'Holding dumbbells at shoulder height with elbows bent and aligned below wrists.' },
      { title: 'Core Bracing', desc: 'Maintaining tight core engagement while holding dumbbells at shoulder level.' },
      { title: 'Upright Seat', desc: 'Sitting or standing upright with straight spine, chest up, and dumbbells at shoulders.' },
      { title: 'Overhead Press', desc: 'Pressing dumbbells upward overhead with controlled shoulder and arm movement.' },
      { title: 'Arm Extension', desc: 'Arms fully extended overhead with dumbbells directly above shoulders.' },
      { title: 'Eccentric Drop', desc: 'Lowering dumbbells slowly back toward shoulder height with full control.' },
      { title: 'Rhythmic Breathing', desc: 'Performing shoulder press with controlled breathing and smooth movement pattern.' }
    ],
    mistakes: [
      'Arching lower back: Puts dangerous shear stress on lumbar spine.',
      'Pressing unevenly: Indicates muscle dominance imbalance.',
      'Locking elbows hard: Strains the elbow joint structure.',
      'Using momentum: Bypasses maximum tension on deltoids.',
      'Shrugging shoulders: Over-recruits trapezius over side shoulders.',
      'Lowering too fast: Risks joint injury on quick drops.',
      'Poor wrist alignment: Causes wrist hyperextension fatigue.'
    ]
  },
  { 
    id: 'ex-07', 
    title: 'Bench Press', 
    muscle: 'Chest', 
    image: '/images/workouts/bench_press.png',
    steps: [
      { title: 'Bench Setup', desc: 'Lie flat on the bench.' },
      { title: 'Grip Width', desc: 'Grip bar slightly wider than shoulders.' },
      { title: 'Feet Anchored', desc: 'Plant feet firmly on floor.' },
      { title: 'Mid-Chest Focus', desc: 'Lower bar to mid-chest.' },
      { title: 'Elbow Angle', desc: 'Keep elbows controlled.' },
      { title: 'Steady Drive', desc: 'Press bar upward steadily.' },
      { title: 'Safe Extension', desc: 'Fully extend arms carefully.' }
    ],
    mistakes: [
      'Bouncing bar on chest: Uses rib elasticity rather than pec drive.',
      'Uneven grip width: Causes asymmetrical chest contraction.',
      'Lifting hips off bench: Hyperextends lumbar and risks injury.',
      'Flaring elbows too much: Stresses anterior shoulder rotators.',
      'Incomplete reps: Halves potential hypertrophy and growth.',
      'No spotter on heavy lifts: Represents a severe safety hazard.',
      'Wrists bending backward: Puts extreme shear on wrist tendons.'
    ]
  },
  { 
    id: 'ex-08', 
    title: 'Lat Pulldown', 
    muscle: 'Lats & Back', 
    image: '/images/workouts/lat_pulldown.png',
    steps: [
      { title: 'Thigh Pad Setup', desc: 'Sit and secure thighs under pads.' },
      { title: 'Overhead Grip', desc: 'Grip bar wider than shoulders.' },
      { title: 'Chest Lift', desc: 'Keep chest lifted.' },
      { title: 'Drive to Chest', desc: 'Pull bar toward upper chest.' },
      { title: 'Scapular Squeeze', desc: 'Squeeze shoulder blades together.' },
      { title: 'Bottom Pause', desc: 'Pause briefly at bottom.' },
      { title: 'Slow Release', desc: 'Slowly return bar upward.' }
    ],
    mistakes: [
      'Pulling behind neck: Places shoulder socket in severe external rotation.',
      'Leaning back excessively: Turns pulldown into a lazy row.',
      'Using momentum: Bypasses the initial lat firing phase.',
      'Incomplete range of motion: Avoids full contraction at bottom.',
      'Shrugging shoulders: Relies on upper neck muscles instead of lats.',
      'Fast return movement: Drops weight tension instantly.',
      'Overloading weight: Limits arm draw path capability.'
    ]
  },
  { 
    id: 'ex-09', 
    title: 'Deadlift', 
    muscle: 'Posterior Chain', 
    image: '/images/workouts/deadlift.png',
    steps: [
      { title: 'Stance Width', desc: 'Stand with feet hip-width apart.' },
      { title: 'Shin Distance', desc: 'Position bar close to shins.' },
      { title: 'Hip Hinge', desc: 'Hinge hips backward.' },
      { title: 'Secure Grip', desc: 'Grip bar firmly.' },
      { title: 'Neutral Spine', desc: 'Keep spine neutral.' },
      { title: 'Forward Drive', desc: 'Lift bar by driving hips forward.' },
      { title: 'Negative Control', desc: 'Lower bar slowly with control.' }
    ],
    mistakes: [
      'Rounded back: Severe disc herniation hazard under heavy loads.',
      'Bar too far from body: Drastically increases lower spinal shear.',
      'Jerking the weight: Causes high mechanical shock on tendons.',
      'Hyperextending at top: Pinches facet joints in the spine.',
      'Looking upward excessively: Places high strain on cervical neck.',
      'Bending arms: Can lead to severe biceps tendon strain.',
      'Using too much weight: Totally breaks proper posterior loading.'
    ]
  },
  { 
    id: 'ex-10', 
    title: 'Mountain Climber', 
    muscle: 'Core & Cardio', 
    image: '/images/workouts/mountain_climber.png',
    steps: [
      { title: 'High Plank', desc: 'Start in high plank position.' },
      { title: 'Hand Alignment', desc: 'Keep hands under shoulders.' },
      { title: 'Core Tightness', desc: 'Tighten core muscles.' },
      { title: 'Knee Drive', desc: 'Drive one knee toward chest.' },
      { title: 'Leg Switch', desc: 'Quickly switch legs.' },
      { title: 'Steady Rhythm', desc: 'Maintain steady rhythm.' },
      { title: 'Hip Stability', desc: 'Keep hips stable throughout.' }
    ],
    mistakes: [
      'Hips bouncing too high: Deactivates lower stomach core support.',
      'Slow pace: Reduces cardiorespiratory building efficacy.',
      'Short knee drive: Restricts full hip flexion and abdominal contract.',
      'Rounded shoulders: Adds joint load to clavicles and traps.',
      'Loose core: Destabilizes torso alignment and sway.',
      'Holding breath: Prevents smooth oxygen-CO2 muscle cycling.',
      'Hands too far forward: Stresses shoulders and forearms unduly.'
    ]
  }
];
