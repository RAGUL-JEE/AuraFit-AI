import pytest
from selenium.webdriver.common.by import By
from pages.schedules_page import SchedulesPage

BASE_URL = "http://localhost:3000"

@pytest.mark.schedule
class TestSchedules:
    def test_schedules_loads(self, browser):
        schedules_page = SchedulesPage(browser)
        schedules_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Schedule']]"))
        
        assert schedules_page.is_loaded(), "Schedules page did not load correctly"
