import pytest
import allure
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage

@pytest.mark.auth
@allure.feature('Authentication')
class TestAuthentication:
    
    @allure.story('Valid Login')
    def test_valid_login(self, driver):
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        login_page.login("testuser@aurafit.ai", "ValidPassword123")
        assert dashboard_page.is_dashboard_loaded(), "Dashboard failed to load after valid login"

    @allure.story('Invalid Credentials')
    def test_invalid_login(self, driver):
        login_page = LoginPage(driver)
        
        login_page.login("invalid@aurafit.ai", "WrongPass")
        assert login_page.is_error_displayed(), "Error message should be displayed for invalid credentials"
