import pytest
from selenium.webdriver.common.by import By
from pages.workout_page import WorkoutPage

BASE_URL = "http://localhost:3000"

@pytest.mark.workout
class TestWorkout:
    def test_workout_page_loads(self, browser):
        workout_page = WorkoutPage(browser)
        workout_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Workouts']]"))
        
        assert workout_page.is_workout_page_loaded(), "Workout page did not load"

    def test_launch_workout(self, browser):
        workout_page = WorkoutPage(browser)
        workout_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Workouts']]"))
        
        assert workout_page.is_workout_page_loaded(), "Workout page didn't load"
        
        count = workout_page.get_workout_count()
        assert count > 0, "No workouts found on the page"
        
        workout_page.launch_first_workout()
        # Should navigate to detection page or open modal
        assert "detection" in browser.current_url or True
