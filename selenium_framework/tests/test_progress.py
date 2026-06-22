import pytest
from selenium.webdriver.common.by import By
from pages.progress_page import ProgressPage

BASE_URL = "http://localhost:3000"

@pytest.mark.progress
class TestProgress:
    def test_progress_loads(self, browser):
        progress_page = ProgressPage(browser)
        progress_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Progress']]"))
        
        assert progress_page.is_loaded(), "Progress page did not load correctly"
