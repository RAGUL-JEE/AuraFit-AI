import sys

with open('detection_server.py', 'r', encoding='utf-8') as f:
    content = f.read()

if 'import base64' not in content:
    content = content.replace('import cv2', 'import base64\nimport cv2')

new_route = """
@app.route("/api/mobile/process_frame", methods=["POST"])
def process_mobile_frame():
    global counter, stage, completed, selected_workout, plank_time_left, last_timer_update, current_set, is_active, target_input, target_sets, start_time

    req_json = request.json or {}
    b64_img = req_json.get("image")
    if not b64_img:
        return jsonify({"error": "No image provided"})

    try:
        if "," in b64_img:
            b64_img = b64_img.split(",")[1]
        img_data = base64.b64decode(b64_img)
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image"})

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

                        color = (34, 197, 94) if correct else (68, 68, 239)

                        mp_draw.draw_landmarks(
                            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_draw.DrawingSpec(color=color, thickness=3, circle_radius=3),
                            mp_draw.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2)
                        )
                except Exception as ex:
                    print(f"Estimation processing error: {ex}")

        ret, buffer = cv2.imencode(".jpg", image)
        out_b64 = base64.b64encode(buffer).decode("utf-8")

        with state_lock:
            if selected_workout == "plank":
                progress_str = f"{max(0, plank_time_left)}s"
                cals = round((target_input - max(0, plank_time_left)) * 0.15, 1)
            else:
                progress_str = f"{counter} / {target_input}"
                cals = round((counter + ((current_set - 1) * target_input)) * 0.4, 1)

            accuracy = 98 if correct else 75
            
            return jsonify({
                "counter": counter,
                "set_str": f"{current_set} / {target_sets}",
                "progress_str": progress_str,
                "calories": cals,
                "time_elapsed": int(time.time() - start_time) if is_active else 0,
                "completed": completed,
                "workout": selected_workout,
                "is_active": is_active,
                "processed_image_base64": out_b64,
                "accuracy": accuracy
            })
    except Exception as e:
        print(f"Frame processing error: {e}")
        return jsonify({"error": str(e)})

"""

if 'def process_mobile_frame():' not in content:
    content = content.replace('if __name__ == "__main__":', new_route + '\nif __name__ == "__main__":')
    with open('detection_server.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated detection_server.py successfully.')
else:
    print('Route already exists.')
