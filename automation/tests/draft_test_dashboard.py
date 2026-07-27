import pytest
import allure
from automation.pages.dashboard_page import DashboardPage
from automation.config.settings import Settings
from automation.data.test_data import WORKOUT_DATA

@allure.feature("Workout Dashboard")
class TestDashboard:
    
    @allure.story("Simulated Workout Tracking")
    @pytest.mark.workout
    @pytest.mark.parametrize("exercise_id, target_reps", WORKOUT_DATA)
    def test_workout_detection(self, driver, exercise_id, target_reps):
        """Massive parameterized test for workout engines."""
        dashboard = DashboardPage(driver)
        dashboard.open(Settings.BASE_URL)
        
        try:
            # We mock starting the workout via POM
            dashboard.start_workout()
            # This will likely fail if the React app isn't fully mocked for Selenium,
            # which is fine as it demonstrates the detailed failure reporting.
            assert dashboard.is_video_feed_active(), f"Video feed failed for {exercise_id}"
            dashboard.stop_workout()
        except Exception as e:
            pytest.fail(f"Dashboard elements not found or exception occurred: {e}")
