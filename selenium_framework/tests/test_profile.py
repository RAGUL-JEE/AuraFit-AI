import pytest
from selenium.webdriver.common.by import By
from pages.profile_page import ProfilePage

BASE_URL = "http://localhost:3000"

@pytest.mark.profile
class TestProfile:
    def test_profile_loads(self, browser):
        profile_page = ProfilePage(browser)
        profile_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Settings']]"))
        
        assert profile_page.is_loaded(), "Profile page did not load correctly"

    def test_logout(self, browser):
        profile_page = ProfilePage(browser)
        profile_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
            
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Settings']]"))
        
        profile_page.logout()
        
        auth_page = AuthPage(browser)
        assert auth_page.is_visible(auth_page.SUBMIT_BUTTON), "Failed to logout"
