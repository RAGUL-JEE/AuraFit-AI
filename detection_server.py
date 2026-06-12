from flask import Flask, render_template_string, Response, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import sqlite3
import pyttsx3
import time
import threading

app = Flask(__name__)
# Enable CORS for frontend compatibility
CORS(app)

mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils
pose = mp_pose.Pose()

# --- VOICE FEEDBACK ENGINES ---
last_spoken_time = 0
COOLDOWN_SECONDS = 3.5

def speak_worker(text):
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Speech engine error: {e}")

def speak(text):
    global last_spoken_time
    current_time = time.time()
    if current_time - last_spoken_time > COOLDOWN_SECONDS:
        last_spoken_time = current_time
        threading.Thread(target=speak_worker, args=(text,), daemon=True).start()

# --- DATABASE SETUP ---
try:
    conn = sqlite3.connect("history.db", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history(
        workout TEXT,
        reps INTEGER,
        calories REAL
    )
    """)
    conn.commit()
except Exception as e:
    print(f"Database setup error: {e}")

# --- WORKOUT METADATA WITH IMAGES AND YOUTUBE REFS ---
WORKOUT_DETAILS = {
    "pushup": {
        "name": "Push-up", "muscle": "Pectoralis Major", "level": "Beginner", "default_reps": 12, "default_sets": 3, "default_time": "02:00",
        "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=IODxDxX7oi4",
        "steps": ["Place your hands slightly wider than shoulder width.", "Keep your body in a straight line.", "Lower your chest toward the floor.", "Keep elbows around 45° from your body.", "Push back up until arms are straight."],
        "mistakes": ["Rounding your lower back", "Using momentum instead of muscle", "Incorrect range of motion", "Flaring elbows out too wide"]
    },
    "squat": {
        "name": "Squat", "muscle": "Quadriceps & Glutes", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:30",
        "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=U3HlEF_E9fo",
        "steps": ["Stand with feet shoulder-width apart.", "Keep chest up and back straight.", "Lower your hips as if sitting on a chair.", "Keep knees aligned with toes.", "Lower until thighs are parallel.", "Push through heels and stand."],
        "mistakes": ["Knees caving inward", "Heels lifting off the floor", "Rounding the lower spine", "Not dropping low enough"]
    },
    "lunges": {
        "name": "Lunge", "muscle": "Quadriceps & Hamstrings", "level": "Beginner", "default_reps": 10, "default_sets": 3, "default_time": "02:00",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
        "steps": ["Stand upright with hands on hips.", "Step one leg forward into a wide stance.", "Lower your body until both knees reach about 90°.", "Push through the front foot to ascend.", "Return to standing and alternate legs."],
        "mistakes": ["Front knee passing far past toes", "Loss of balance or torso leaning too far", "Back knee striking the floor hard"]
    },
    "plank": {
        "name": "Plank", "muscle": "Core & Transverse Abdominis", "level": "Beginner", "default_reps": 30, "default_sets": 3, "default_time": "00:40",
        "image_url": "https://images.unsplash.com/photo-1566241477600-ac026ad43874?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
        "steps": ["Place elbows directly under shoulders.", "Extend legs completely straight behind you.", "Keep your body in a rigid uniform line.", "Tighten core and glute muscle groups.", "Hold position cleanly without dropping hips."],
        "mistakes": ["Dropping or sagging hips down", "Raising your butt too high upward", "Hyperextending the neck alignment"]
    },
    "bicep": {
        "name": "Bicep Curl", "muscle": "Biceps Brachii", "level": "Beginner", "default_reps": 12, "default_sets": 3, "default_time": "01:30",
        "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=ykJmrZ5v0Dio",
        "steps": ["Hold dumbbells down at your sides.", "Keep your elbows locked close to your torso.", "Curl weights upward smoothly via forearms.", "Squeeze biceps firmly at the peak configuration.", "Lower the load slowly back down."],
        "mistakes": ["Swinging your upper body for leverage", "Elbows drifting forward during flex", "Dropping weights instantly without tension"]
    },
    "shoulderpress": {
        "name": "Shoulder Press", "muscle": "Deltoids", "level": "Beginner", "default_reps": 12, "default_sets": 3, "default_time": "02:00",
        "image_url": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=HzIiFi_8RFg",
        "steps": ["Hold dumbbells upright at shoulder height levels.", "Keep your core tightly braced continuously.", "Drive and push weights straight up overhead.", "Lower back down slowly to shoulder plane positions.", "Repeat fluidly with control."],
        "mistakes": ["Arching the lower back excessively", "Flaring elbows radically outward", "Incomplete vertical locking extensions"]
    },
    "benchpress": {
        "name": "Bench Press", "muscle": "Pectoralis Major", "level": "Beginner", "default_reps": 10, "default_sets": 3, "default_time": "02:30",
        "image_url": "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=4Y2ZdHCOXok",
        "steps": ["Lie completely flat down on a stable bench.", "Grip the barbell slightly wider than shoulder spans.", "Lower the bar down to mid-chest levels slowly.", "Push upward powerfully until arms fully extend.", "Repeat tracking balance carefully."],
        "mistakes": ["Bouncing the barbell off your chest sternum", "Lifting hips off the bench flat plane", "Asymmetrical bar tracking path paths"]
    },
    "latpulldown": {
        "name": "Lat Pulldown", "muscle": "Latissimus Dorsi", "level": "Beginner", "default_reps": 12, "default_sets": 3, "default_time": "02:00",
        "image_url": "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=CAwf7n6Luuc",
        "steps": ["Sit securely at the system station machine.", "Grasp the overhead bar wider than shoulder frame width.", "Pull bar down cleanly toward your upper chest region.", "Squeeze shoulder blades tightly at the base line.", "Slowly return bar upward under load resistance."],
        "mistakes": ["Leaning backwards excessively to yank the bar", "Pulling the bar down behind the neck path", "Not completing the full base pull phase"]
    },
    "deadlift": {
        "name": "Deadlift", "muscle": "Posterior Chain & Hamstrings", "level": "Beginner", "default_reps": 10, "default_sets": 3, "default_time": "03:00",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=r4MzxtBKyNE",
        "steps": ["Stand with feet spaced hip-width apart under the bar.", "Hinge backward at hips and slightly bend knees down.", "Grip the bar firmly outside structural knee placement.", "Lift weight smoothly by pushing straight through heels.", "Keep back straight and finish with locked hips.", "Lower weight under control back to ground."],
        "mistakes": ["Rounding the lower lumbar back completely", "Bar path drifting away from shins", "Squatting the weight rather than hinging hips"]
    },
    "mountainclimber": {
        "name": "Mountain Climber", "muscle": "Core & Cardiovascular System", "level": "Beginner", "default_reps": 30, "default_sets": 3, "default_time": "00:30",
        "image_url": "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=600&auto=format&fit=crop",
        "youtube_url": "https://www.youtube.com/watch?v=cnyTQDSE884",
        "steps": ["Assume a strong high push-up plank stance.", "Drive one knee forward clean under your chest.", "Quickly transition and switch legs alternatively.", "Maintain a highly active, steady tracking pace."],
        "mistakes": ["Bouncing hips up and down radically", "Not bringing knees far enough forward", "Letting shoulders drift backward off alignment"]
    }
}

# Mapping React exercise IDs to Python keys
REACT_TO_PY_WORKOUT = {
    "ex-01": "pushup",
    "ex-02": "squat",
    "ex-03": "lunges",
    "ex-04": "plank",
    "ex-05": "bicep",
    "ex-06": "shoulderpress",
    "ex-07": "benchpress",
    "ex-08": "latpulldown",
    "ex-09": "deadlift",
    "ex-10": "mountainclimber"
}

# --- GLOBAL VARIABLES WITH THREAD SAFENESS ---
state_lock = threading.Lock()

selected_workout = "pushup"
counter = 0
target_input = 12
target_sets = 3
current_set = 1
plank_time_left = 0
last_timer_update = 0
completed = False
stage = None
start_time = time.time()
is_active = False

# Lazy-loaded camera object to handle process startups and release/reload cycles nicely
cap = None

def get_cap():
    global cap
    if cap is None:
        try:
            # Use DirectShow backend for instant camera initialization on Windows
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if not cap.isOpened():
                # Fallback to default if DirectShow is not supported or fails
                cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                print("⚠️ Warning: OpenCV could not open VideoCapture(0).")
        except Exception as e:
            print(f"Error accessing webcam: {e}")
    return cap

def angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    ang = np.abs(radians * 180 / np.pi)
    if ang > 180:
        ang = 360 - ang
    return ang

def generate_frames():
    global counter, stage, completed, selected_workout, plank_time_left, last_timer_update, current_set, is_active, cap

    while True:
        # Check active status outside block to avoid unnecessary camera queries
        if not is_active:
            # Stream a standby graphic overlay when tracking is off
            standby_img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(standby_img, "AI Detection - Standby", (150, 220), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 100), 2)
            cv2.putText(standby_img, "Waiting for Start command...", (160, 260), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
            ret, buffer = cv2.imencode(".jpg", standby_img)
            yield (b'--frame\r\n'
                   b'Content-Type:image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.3)
            continue

        camera = get_cap()
        if camera is None or not camera.isOpened():
            # Graceful error graphic fallback
            err_img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(err_img, "Webcam busy or not found!", (160, 220), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.putText(err_img, "Please release camera or check hardware.", (110, 260), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
            ret, buffer = cv2.imencode(".jpg", err_img)
            yield (b'--frame\r\n'
                   b'Content-Type:image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.5)
            continue

        success, frame = camera.read()
        if not success:
            time.sleep(0.05)
            continue

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        correct = False
        current_loop_time = time.time()

        with state_lock:
            if is_active:
                try:
                    if results.pose_landmarks:
                        lm = results.pose_landmarks.landmark

                        shoulder_l = [lm[11].x * w, lm[11].y * h]
                        elbow_l = [lm[13].x * w, lm[13].y * h]
                        wrist_l = [lm[15].x * w, lm[15].y * h]
                        hip_l = [lm[23].x * w, lm[23].y * h]
                        knee_l = [lm[25].x * w, lm[25].y * h]
                        ankle_l = [lm[27].x * w, lm[27].y * h]

                        shoulder_r = [lm[12].x * w, lm[12].y * h]
                        elbow_r = [lm[14].x * w, lm[14].y * h]
                        wrist_r = [lm[16].x * w, lm[16].y * h]
                        hip_r = [lm[24].x * w, lm[24].y * h]
                        knee_r = [lm[26].x * w, lm[26].y * h]
                        ankle_r = [lm[28].x * w, lm[28].y * h]

                        if lm[11].visibility > lm[12].visibility:
                            shoulder, elbow, wrist, hip, knee, ankle = shoulder_l, elbow_l, wrist_l, hip_l, knee_l, ankle_l
                        else:
                            shoulder, elbow, wrist, hip, knee, ankle = shoulder_r, elbow_r, wrist_r, hip_r, knee_r, ankle_r

                        if selected_workout == "plank":
                            if plank_time_left <= 0:
                                if not completed:
                                    completed = True
                                    is_active = False
                                    speak("Plank set complete!")
                        else:
                            if counter >= target_input:
                                if not completed:
                                    if current_set >= target_sets:
                                        completed = True
                                        is_active = False
                                        speak("Workout routine fully completed!")
                                    else:
                                        current_set += 1
                                        counter = 0
                                        speak(f"Set complete. Move to set {current_set}.")

                        if not completed:
                            if selected_workout == "pushup":
                                ang = angle(shoulder, elbow, wrist)
                                body_line = angle(shoulder, hip, knee)
                                if body_line < 155:
                                    speak("Keep your body straight.")
                                elif ang > 160:
                                    if stage == "up" or stage is None:
                                        stage = "down"
                                    correct = True
                                elif ang < 90 and stage == "down":
                                    stage = "up"
                                    counter += 1
                                    correct = True
                                else:
                                    correct = True

                            elif selected_workout == "squat":
                                ang = angle(hip, knee, ankle)
                                back_angle = angle(shoulder, hip, knee)
                                if back_angle < 45:
                                    speak("Keep your chest upright.")
                                elif ang > 165:
                                    if stage == "down" or stage is None:
                                        stage = "up"
                                    correct = True
                                elif ang < 100 and stage == "up":
                                    stage = "down"
                                    counter += 1
                                    correct = True
                                else:
                                    correct = True

                            elif selected_workout == "lunges":
                                ang = angle(hip, knee, ankle)
                                if ang < 100:
                                    if stage == "up" or stage is None:
                                        stage = "down"
                                        counter += 1
                                        correct = True
                                else:
                                    stage = "up"
                                    correct = True

                            elif selected_workout == "plank":
                                ang = angle(shoulder, hip, ankle)
                                correct = (160 < ang < 180)
                                if correct:
                                    if last_timer_update == 0:
                                        last_timer_update = current_loop_time
                                    elapsed_tick = current_loop_time - last_timer_update
                                    if elapsed_tick >= 1.0:
                                        plank_time_left -= int(elapsed_tick)
                                        last_timer_update = current_loop_time
                                else:
                                    last_timer_update = current_loop_time

                            elif selected_workout == "bicep":
                                ang = angle(shoulder, elbow, wrist)
                                if ang > 160:
                                    if stage == "up" or stage is None:
                                        stage = "down"
                                    correct = True
                                elif ang < 40 and stage == "down":
                                    stage = "up"
                                    counter += 1
                                    correct = True
                                else:
                                    correct = True

                            elif selected_workout == "shoulderpress":
                                ang = angle(shoulder, elbow, wrist)
                                if lm[15].y < lm[11].y and lm[16].y < lm[12].y:
                                    if ang > 150 and stage == "down":
                                        stage = "up"
                                        counter += 1
                                        correct = True
                                    elif ang < 100:
                                        stage = "down"
                                        correct = True
                                    else:
                                        correct = True
                                else:
                                    stage = "down"
                                    correct = True

                            elif selected_workout == "benchpress":
                                ang = angle(shoulder, elbow, wrist)
                                if ang > 155:
                                    if stage == "down" or stage is None:
                                        stage = "up"
                                    correct = True
                                elif ang < 95 and stage == "up":
                                    stage = "down"
                                    counter += 1
                                    correct = True
                                else:
                                    correct = True

                            elif selected_workout == "latpulldown":
                                ang = angle(shoulder, elbow, wrist)
                                if ang < 85:
                                    if stage == "up" or stage is None:
                                        stage = "down"
                                        counter += 1
                                        correct = True
                                elif ang > 150:
                                    stage = "up"
                                    correct = True
                                else:
                                    correct = True

                            elif selected_workout == "deadlift":
                                hip_flex = angle(shoulder, hip, knee)
                                if hip_flex > 165:
                                    if stage == "down" or stage is None:
                                        stage = "up"
                                        counter += 1
                                        correct = True
                                elif hip_flex < 120:
                                    stage = "down"
                                    correct = True
                                else:
                                    correct = True

                            elif selected_workout == "mountainclimber":
                                if lm[25].y < lm[23].y or lm[26].y < lm[24].y:
                                    if stage == "down" or stage is None:
                                        stage = "up"
                                        counter += 1
                                        correct = True
                                else:
                                    stage = "down"
                                    correct = True

                        # Draw the skeleton landmarks
                        # Green glowing joints (34, 197, 94) for correct posture, Red glowing joints (239, 68, 68) for incorrect posture (BGR)
                        color = (34, 197, 94) if correct else (68, 68, 239)

                        mp_draw.draw_landmarks(
                            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_draw.DrawingSpec(color=color, thickness=3, circle_radius=3),
                            mp_draw.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2)
                        )
                except Exception as ex:
                    print(f"Estimation processing error: {ex}")

        ret, buffer = cv2.imencode(".jpg", image)
        yield (b'--frame\r\n'
               b'Content-Type:image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route("/api/state")
def get_state():
    global counter, plank_time_left, current_set, selected_workout, target_input, target_sets, completed, start_time, is_active
    with state_lock:
        if selected_workout == "plank":
            progress_str = f"{max(0, plank_time_left)}s"
            cals = round((target_input - max(0, plank_time_left)) * 0.15, 1)
        else:
            progress_str = f"{counter} / {target_input}"
            cals = round((counter + ((current_set - 1) * target_input)) * 0.4, 1)
            
        return jsonify({
            "counter": counter,
            "set_str": f"{current_set} / {target_sets}",
            "progress_str": progress_str,
            "calories": cals,
            "time_elapsed": int(time.time() - start_time) if is_active else 0,
            "completed": completed,
            "workout": selected_workout,
            "is_active": is_active
        })

@app.route("/api/control", methods=["POST"])
def control_workout():
    global is_active, start_time, counter, current_set, completed, plank_time_left, target_input, target_sets, last_timer_update, selected_workout, stage, cap
    
    req_json = request.json or {}
    action = req_json.get("action")
    
    with state_lock:
        if action == "start":
            # Map React workout ID to python key if present
            workout_id = req_json.get("workout")
            if workout_id:
                selected_workout = REACT_TO_PY_WORKOUT.get(workout_id, selected_workout)
            
            # Read configuration
            target = req_json.get("target")
            sets = req_json.get("sets")
            if target is not None:
                target_input = int(target)
            if sets is not None:
                target_sets = int(sets)

            is_active = True
            completed = False
            stage = None
            start_time = time.time()
            if selected_workout == "plank":
                plank_time_left = target_input
                last_timer_update = 0
            
            counter = 0
            current_set = 1
            speak(f"Starting {WORKOUT_DETAILS.get(selected_workout, {}).get('name', selected_workout)}.")
            
        elif action == "stop":
            is_active = False
            if cap is not None:
                try:
                    cap.release()
                except Exception:
                    pass
                cap = None
            
        elif action == "reset":
            counter = 0
            current_set = 1
            completed = False
            is_active = False
            stage = None
            if selected_workout == "plank":
                plank_time_left = target_input
            if cap is not None:
                try:
                    cap.release()
                except Exception:
                    pass
                cap = None
                
    return jsonify({"status": "success", "workout": selected_workout, "is_active": is_active})

@app.route("/", methods=["GET", "POST"])
def home():
    global selected_workout, target_input, target_sets, counter, stage, start_time, completed, plank_time_left, last_timer_update, current_set, is_active

    if request.method == "POST":
        with state_lock:
            selected_workout = request.form.get("workout", "pushup")
            target_input = int(request.form.get("target", 12))
            target_sets = int(request.form.get("sets", 3))
            counter = 0
            current_set = 1
            stage = None
            completed = False
            is_active = False
            if selected_workout == "plank":
                plank_time_left = target_input
                last_timer_update = 0

    current_meta = WORKOUT_DETAILS.get(selected_workout, WORKOUT_DETAILS["pushup"])

    dashboard_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Gym Coach - Ultimate Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-[#F8FAFC] font-sans text-slate-800 antialiased min-h-screen flex">

        <div id="workoutModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center hidden">
            <div class="bg-white rounded-3xl max-w-5xl w-full p-8 max-h-[85vh] overflow-y-auto shadow-2xl m-4">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-black text-slate-900">Select Workout Engine</h2>
                        <p class="text-sm text-slate-400">Choose from 10 dynamic computer-vision optimized exercises.</p>
                    </div>
                    <button onclick="toggleModal(false)" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {% for key, val in all_workouts.items() %}
                    <div class="border {% if key == active_key %}border-emerald-500 bg-emerald-50/30{% else %}border-slate-200 bg-white{% endif %} rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <span class="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{{ val.level }}</span>
                                <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                    {{ loop.index }}
                                </div>
                            </div>
                            <h4 class="font-black text-slate-900 text-base mb-0.5">{{ val.name }}</h4>
                            <p class="text-xs text-rose-600 font-semibold mb-3 flex items-center gap-1">
                                <i class="fa-solid fa-bullseye text-[10px]"></i> {{ val.muscle }}
                            </p>
                        </div>
                        <form method="POST" class="mt-2">
                            <input type="hidden" name="workout" value="{{ key }}">
                            <input type="hidden" name="target" value="{{ val.default_reps }}">
                            <input type="hidden" name="sets" value="{{ val.default_sets }}">
                            <button type="submit" class="w-full text-center text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition bg-white text-slate-700 hover:bg-slate-50">
                                Launch Detection
                            </button>
                        </form>
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>

        <aside class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 shrink-0">
            <div>
                <div class="flex items-center gap-3 mb-8">
                    <div class="bg-emerald-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-100">
                        <i class="fa-solid fa-child-reaching text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-md font-black tracking-tight uppercase text-slate-900 leading-none mb-1">AI GYM COACH</h2>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Smart Fitness. Smarter You.</p>
                    </div>
                </div>

                <nav class="space-y-1">
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-house w-5"></i> Home
                    </a>
                    <button onclick="toggleModal(true)" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-xl transition">
                        <span class="flex items-center gap-3"><i class="fa-solid fa-video w-5"></i> AI Detection</span>
                        <i class="fa-solid fa-chevron-right text-xs opacity-60"></i>
                    </button>
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-heart w-5"></i> Favorites
                    </a>
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-calendar-days w-5"></i> Schedule
                    </a>
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-chart-line w-5"></i> Progress
                    </a>
                </nav>
            </div>
            <div class="space-y-4">
                <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                    <i class="fa-solid fa-gear w-5"></i> Settings
                </a>
                <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-2xl shadow-sm relative overflow-hidden">
                    <h4 class="text-sm font-bold text-emerald-900 mb-1">Stay Consistent</h4>
                    <p class="text-xs text-emerald-700 mb-3 leading-relaxed">Track your progress and achieve your fitness goals with AI support.</p>
                    <button onclick="toggleModal(true)" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition">
                        Switch Routine
                    </button>
                </div>
            </div>
        </aside>

        <main class="flex-1 flex flex-col min-w-0">
            <header class="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-4">
                    <button onclick="toggleModal(true)" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                        <i class="fa-solid fa-arrow-left text-[10px]"></i> Change Exercise
                    </button>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        {{ meta.name }} <span class="text-xl">💪</span>
                    </h1>
                    <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> AI Detection Mode
                    </span>
                </div>
            </header>

            <div class="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">
                
                <div class="col-span-8 flex flex-col gap-6">
                    <div class="bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-video relative border border-slate-200/60">
                        <img src="/video" class="w-full h-full object-cover" alt="Live Processing Feed">
                    </div>

                    <div class="grid grid-cols-5 gap-4">
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div class="text-emerald-500 font-black text-3xl mb-0.5">92%</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Form Score</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudCalories" class="text-orange-500 font-black text-3xl mb-0.5">0</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calories</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudSets" class="text-blue-500 font-black text-3xl mb-0.5">1 / {{ target_sets }}</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sets Done</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudProgress" class="text-yellow-500 font-black text-3xl mb-0.5">0 / {{ target_input }}</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudTimer" class="text-indigo-500 font-black text-3xl mb-0.5">00:00</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Elapsed</div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center justify-between">
                        <div class="flex gap-3">
                            <button onclick="controlWorkout('start')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition">Start</button>
                            <button onclick="controlWorkout('stop')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition">Stop</button>
                            <button onclick="controlWorkout('reset')" class="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition">Reset</button>
                        </div>
                    </div>
                </div>

                <div class="col-span-4 flex flex-col gap-6">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider">Exercise Details</h3>
                            <span class="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{{ meta.level }}</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-xs pb-1 border-b border-slate-50">
                                <span class="text-slate-400 font-medium">Target Muscle Group:</span>
                                <span class="font-bold text-slate-700">{{ meta.muscle }}</span>
                            </div>
                        </div>

                        <div class="bg-slate-100 rounded-2xl aspect-video mb-4 border border-slate-200 overflow-hidden relative shadow-sm">
                            <img src="{{ meta.image_url }}" alt="{{ meta.name }} reference form" class="w-full h-full object-cover">
                            <div class="absolute bottom-2 left-3 bg-slate-900/70 px-2 py-1 rounded text-[10px] text-white font-bold tracking-wide">
                                <i class="fa-solid fa-dumbbell mr-1"></i> Reference Pose
                            </div>
                        </div>

                        <div class="border-t border-slate-100 pt-4">
                            <a href="{{ meta.youtube_url }}" target="_blank" class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition tracking-wide shadow-sm">
                                <i class="fa-brands fa-youtube text-sm text-rose-500"></i> Open Video Tutorial <i class="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-70"></i>
                            </a>
                            <p class="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                                Review this external form guide on YouTube to fix stance configuration coordinates.
                            </p>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 class="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-list-check"></i> Execution Guide
                        </h3>
                        <ul class="space-y-3">
                            {% for step in meta.steps %}
                            <li class="flex items-start gap-3 text-xs font-medium text-slate-600 leading-normal">
                                <span class="bg-slate-100 text-slate-800 font-bold text-[10px] w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5">{{ loop.index }}</span>
                                {{ step }}
                            </li>
                            {% endfor %}
                        </ul>
                    </div>
                </div>

            </div>
        </main>

        <script>
            function toggleModal(show) {
                const modal = document.getElementById('workoutModal');
                if (show) modal.classList.remove('hidden');
                else modal.classList.add('hidden');
            }

            function controlWorkout(actionName) {
                fetch('/api/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: actionName })
                });
            }

            function formatTime(seconds) {
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                return `${mins}:${secs}`;
            }

            setInterval(() => {
                fetch('/api/state')
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('hudCalories').innerText = data.calories;
                        document.getElementById('hudSets').innerText = data.set_str;
                        document.getElementById('hudProgress').innerText = data.progress_str;
                        document.getElementById('hudTimer').innerText = formatTime(data.time_elapsed);
                    });
            }, 400);
        </script>
    </body>
    </html>
    """
    return render_template_string(dashboard_html, meta=current_meta, active_key=selected_workout, target_input=target_input, target_sets=target_sets, all_workouts=WORKOUT_DETAILS)

@app.route("/video")
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True, threaded=True, port=5001, host="0.0.0.0")
