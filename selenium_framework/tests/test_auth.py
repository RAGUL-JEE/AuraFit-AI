import pytest
from pages.auth_page import AuthPage
from pages.dashboard_page import DashboardPage

BASE_URL = "http://localhost:3000"

@pytest.mark.auth
class TestAuth:
    def test_successful_login(self, browser):
        auth_page = AuthPage(browser)
        auth_page.navigate_to(BASE_URL)
        auth_page.login("test@example.com", "password123")
        
        dashboard = DashboardPage(browser)
        assert dashboard.is_dashboard_loaded(), "Dashboard failed to load after login"

    def test_invalid_login(self, browser):
        auth_page = AuthPage(browser)
        auth_page.navigate_to(BASE_URL)
        auth_page.login("", "wrongpass")
        # Since it bypasses, empty email should not log in
        assert auth_page.is_visible(auth_page.SUBMIT_BUTTON), "Should remain on login page"
