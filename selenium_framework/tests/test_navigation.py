import pytest
from pages.navigation_page import NavigationPage

BASE_URL = "http://localhost:3000"

@pytest.mark.nav
class TestNavigation:
    def test_navigation_links(self, browser):
        # Navigation requires auth, so ideally we login first, 
        # or we assume we bypass auth if we are already in the dashboard
        nav_page = NavigationPage(browser)
        nav_page.navigate_to(BASE_URL)
        
        # We might be on Login page, we should login first
        from pages.auth_page import AuthPage
        auth_page = AuthPage(browser)
        if auth_page.is_visible(auth_page.SUBMIT_BUTTON):
            auth_page.login("test@example.com", "password123")
            import time
            time.sleep(2)
            
        # Now we should be on dashboard
        nav_page.go_to_workout()
        from pages.workout_page import WorkoutPage
        workout = WorkoutPage(browser)
        assert workout.is_workout_page_loaded(), "Failed navigating to workout"
        
        nav_page.go_to_progress()
        from pages.progress_page import ProgressPage
        progress = ProgressPage(browser)
        assert progress.is_loaded(), "Failed navigating to progress"
        
        nav_page.go_to_profile()
        from pages.profile_page import ProfilePage
        profile = ProfilePage(browser)
        assert profile.is_loaded(), "Failed navigating to profile/settings"
