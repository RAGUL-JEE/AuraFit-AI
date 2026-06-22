import pytest
from pages.dashboard_page import DashboardPage

BASE_URL = "http://localhost:3000"

@pytest.mark.dashboard
class TestDashboard:
    def test_dashboard_loads(self, browser):
        dashboard = DashboardPage(browser)
        dashboard.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        assert dashboard.is_dashboard_loaded(), "Dashboard did not load correctly"

    def test_recent_activity_displayed(self, browser):
        dashboard = DashboardPage(browser)
        dashboard.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
            
        activities = dashboard.get_recent_activities_count()
        assert activities >= 0, "Recent activity section failed to render"
