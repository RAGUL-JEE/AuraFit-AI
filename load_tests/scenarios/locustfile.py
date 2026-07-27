from locust import HttpUser, task, between, LoadTestShape
import random

class AuraFitUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        # Simulate user login and obtaining token
        self.client.post("/api/auth/login", json={"email": "test@aurafit.ai", "password": "password"}, name="Authentication: Login")
        self.token = "mock_jwt_token"
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(3)
    def dashboard_load(self):
        self.client.get("/api/dashboard", headers=self.headers, name="Home Dashboard: Loading")
        self.client.get("/api/dashboard/stats", headers=self.headers, name="Home Dashboard: Statistics")

    @task(4)
    def workout_browsing(self):
        self.client.get("/api/workouts", headers=self.headers, name="Workout: Listing")
        workout_id = random.randint(1, 100)
        self.client.get(f"/api/workouts/{workout_id}", headers=self.headers, name="Workout: Details")

    @task(1)
    def ai_detection_simulation(self):
        # Heavy payload for AI detection simulation
        payload = {"frame_data": "base64_encoded_frame", "timestamp": 123456789}
        self.client.post("/api/ai/pose-detection", json=payload, headers=self.headers, name="AI Detection: Pose API")

    @task(2)
    def progress_tracking(self):
        self.client.get("/api/progress/analytics", headers=self.headers, name="Progress: Analytics")

class SpikeTestingShape(LoadTestShape):
    """
    Simulates a spike in traffic
    """
    time_limit = 60
    spawn_rate = 100
    
    def tick(self):
        run_time = self.get_run_time()
        if run_time < self.time_limit:
            # Spike from 100 to 5000 users midway
            if run_time < 20:
                return (100, 20)
            elif run_time < 40:
                return (5000, 500)
            else:
                return (100, 100)
        return None
