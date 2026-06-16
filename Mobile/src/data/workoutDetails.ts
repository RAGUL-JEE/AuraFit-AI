export const WORKOUT_DETAILS: Record<string, any> = {
  pushup: {
    title: 'Push-up',
    video: {
      title: 'How to Do a Push Up - Proper Form & Technique',
      channel: 'Calisthenics Movement',
      duration: '4:15',
      thumbnail: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop', // placeholder man doing pushups
      url: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      localVideoName: 'mp4.mp4'
    },
    postures: [
      { label: 'STEP 1 — START', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400&auto=format&fit=crop' },
      { label: 'STEP 3 — DESCENT', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Place your hands slightly wider than shoulder width.' },
      { step: 2, title: 'Step 2', desc: 'Keep your body in a straight line.' },
      { step: 3, title: 'Step 3', desc: 'Lower your chest toward the floor.' },
      { step: 4, title: 'Step 4', desc: 'Keep elbows around 45° from your body.' },
      { step: 5, title: 'Step 5', desc: 'Push back up until arms are straight.' },
      { step: 6, title: 'Step 6', desc: 'Repeat.' },
    ],
    mistakes: [
      { title: 'Dropping hips too low', desc: 'Ensure glutes and core are active to keep your lower back from sagging.' },
      { title: 'Raising hips too high', desc: 'Avoid poking hips in the air; keep body aligned like a straight plank.' },
      { title: 'Elbows flaring out too much', desc: 'Tuck elbow joints to about 45 degrees to avoid excessive load on rotator cuff.' },
      { title: 'Not lowering chest enough', desc: 'Descend with full range of motion until chest is near the floor.' },
      { title: 'Moving neck forward', desc: 'Keep a neutral head and cervical spine alignment; look slightly ahead.' },
    ]
  },
  squat: {
    title: 'Squat',
    video: {
      title: 'Squat Form Masterclass',
      channel: 'Squat University',
      duration: '5:20',
      thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=gcNh17Ckjgg',
      localVideoName: 'tutorial_v_mp_.mp4'
    },
    postures: [
      { label: 'STEP 1 — STAND', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop' },
      { label: 'STEP 2 — SQUAT', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Stand with feet slightly wider than hip-width apart.' },
      { step: 2, title: 'Step 2', desc: 'Keep your chest up and core braced.' },
      { step: 3, title: 'Step 3', desc: 'Push your hips back and bend your knees.' },
      { step: 4, title: 'Step 4', desc: 'Lower until your thighs are parallel to the floor.' },
      { step: 5, title: 'Step 5', desc: 'Push through your heels to return to standing.' },
    ],
    mistakes: [
      { title: 'Knees caving in', desc: 'Push your knees outward tracking over your toes.' },
      { title: 'Heels lifting off the floor', desc: 'Keep your weight distributed evenly across your feet.' },
      { title: 'Rounding the lower back', desc: 'Maintain a neutral spine throughout the movement.' },
    ]
  },
  plank: {
    title: 'Plank',
    video: {
      title: 'How to Plank Correctly',
      channel: 'Core Fitness',
      duration: '3:10',
      thumbnail: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
      localVideoName: 'plank.mp4'
    },
    postures: [
      { label: 'STEP 1 — HOLD', image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Plant hands directly under shoulders (like a push-up).' },
      { step: 2, title: 'Step 2', desc: 'Ground toes into the floor and squeeze glutes.' },
      { step: 3, title: 'Step 3', desc: 'Neutralize neck and spine.' },
      { step: 4, title: 'Step 4', desc: 'Hold the position for the specified time.' }
    ],
    mistakes: [
      { title: 'Hips dropping', desc: 'Engage core to prevent lower back strain.' },
      { title: 'Looking up', desc: 'Keep gaze on the floor to maintain neck alignment.' }
    ]
  },
  lunge: {
    title: 'Lunge',
    video: {
      title: 'Perfect Lunge Form',
      channel: 'Leg Day Everyday',
      duration: '4:00',
      thumbnail: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
      localVideoName: 'lunge.mp4'
    },
    postures: [
      { label: 'STEP 1 — STEP', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=400&auto=format&fit=crop' },
      { label: 'STEP 2 — DROP', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Stand tall with feet hip-width apart.' },
      { step: 2, title: 'Step 2', desc: 'Take a big step forward with right leg.' },
      { step: 3, title: 'Step 3', desc: 'Lower your body until right thigh is parallel to floor.' },
      { step: 4, title: 'Step 4', desc: 'Push off the right foot to return to start.' }
    ],
    mistakes: [
      { title: 'Knee passing toes too much', desc: 'Take a wider step if you feel knee pressure.' },
      { title: 'Torso leaning forward', desc: 'Keep your chest up and shoulders back.' }
    ]
  },
  deadlift: {
    title: 'Deadlift',
    video: {
      title: 'How to Deadlift Safely',
      channel: 'Barbell Brigade',
      duration: '6:30',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      localVideoName: 'deadlift_tutorial_mp_.mp4'
    },
    postures: [
      { label: 'STEP 1 — SETUP', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
      { label: 'STEP 2 — PULL', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Stand with mid-foot under the barbell.' },
      { step: 2, title: 'Step 2', desc: 'Bend over and grab the bar shoulder-width apart.' },
      { step: 3, title: 'Step 3', desc: 'Bend knees until shins touch the bar.' },
      { step: 4, title: 'Step 4', desc: 'Lift chest up and straighten lower back.' },
      { step: 5, title: 'Step 5', desc: 'Take a big breath, hold it, and stand up with the weight.' }
    ],
    mistakes: [
      { title: 'Rounding the back', desc: 'Dangerous for the spine. Keep lower back straight.' },
      { title: 'Bar drifting away', desc: 'Keep the bar in contact with your legs the whole time.' }
    ]
  },
  mountain_climber: {
    title: 'Mountain Climber',
    video: {
      title: 'Mountain Climber HIIT Guide',
      channel: 'Cardio Kings',
      duration: '2:45',
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
      localVideoName: 'mountain_climber_tutorial_mp_.mp4'
    },
    postures: [
      { label: 'STEP 1 — PLANK', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop' },
      { label: 'STEP 2 — DRIVE', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Start in a traditional plank position.' },
      { step: 2, title: 'Step 2', desc: 'Bring your right knee forward under your chest.' },
      { step: 3, title: 'Step 3', desc: 'Switch legs, bringing left knee forward while right leg goes back.' },
      { step: 4, title: 'Step 4', desc: 'Keep switching legs and pick up the pace.' }
    ],
    mistakes: [
      { title: 'Bouncing hips', desc: 'Keep hips low and level throughout the movement.' },
      { title: 'Shoulders shifting back', desc: 'Keep shoulders stacked directly over your wrists.' }
    ]
  },
  bicep: {
    title: 'Bicep Curl',
    video: {
      title: 'Bicep Curl - Proper Form & Technique',
      channel: 'Athlean-X',
      duration: '5:45',
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
      localVideoName: 'bicep_curl.mp4'
    },
    postures: [
      { label: 'STEP 1 — EXTENSION', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop' },
      { label: 'STEP 2 — FLEXION', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop' }
    ],
    steps: [
      { step: 1, title: 'Step 1', desc: 'Stand tall holding dumbbells with an underhand grip.' },
      { step: 2, title: 'Step 2', desc: 'Keep your elbows tucked closely to your sides.' },
      { step: 3, title: 'Step 3', desc: 'Curl the weights upward while contracting your biceps.' },
      { step: 4, title: 'Step 4', desc: 'Squeeze at the top of the movement.' },
      { step: 5, title: 'Step 5', desc: 'Slowly lower the weights back down.' }
    ],
    mistakes: [
      { title: 'Using momentum', desc: 'Avoid swinging your body; keep your torso perfectly still.' },
      { title: 'Elbows moving forward', desc: 'Lock elbows by your side; do not let them drift up.' }
    ]
  }
};
