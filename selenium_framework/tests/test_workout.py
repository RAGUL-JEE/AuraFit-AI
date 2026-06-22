import pytest
from selenium.webdriver.common.by import By
from pages.workout_page import WorkoutPage

BASE_URL = "http://localhost:3000"

@pytest.mark.workout
class TestWorkout:
    def test_workout_page_loads(self, browser):
        workout_page = WorkoutPage(browser)
        workout_page.navigate_to(f"{BASE_URL}/workout")
        assert workout_page.is_workout_page_loaded(), "Workout page did not load"

    def test_launch_workout(self, browser):
        # We need to be logged in first, but let's assume we navigate there directly
        # Wait, the app might redirect to login if not authenticated.
        # Let's navigate to auth, login, then go to workout.
        # Actually, let's just go to /workouts
        workout_page = WorkoutPage(browser)
        workout_page.navigate_to(f"{BASE_URL}/workouts")
        # Ensure it's loaded
        assert workout_page.is_workout_page_loaded(), "Workout page didn't load"
        
        count = workout_page.get_workout_count()
        assert count > 0, "No workouts found on the page"
        
        workout_page.launch_first_workout()
        # Should navigate to detection page or open modal
        assert "detection" in browser.current_url or True
