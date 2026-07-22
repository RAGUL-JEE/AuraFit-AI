import pytest
import allure
from automation.pages.auth_page import AuthPage
from automation.config.settings import Settings
from automation.data.test_data import AUTH_DATA

@allure.feature("Authentication")
class TestAuthentication:
    
    @allure.story("Invalid Login Variations")
    @pytest.mark.auth
    @pytest.mark.parametrize("email, password", AUTH_DATA)
    def test_invalid_login(self, driver, email, password):
        """Massive parameterized test to simulate rigorous negative testing."""
        auth_page = AuthPage(driver)
        auth_page.open(Settings.BASE_URL)
        
        # Since we might not actually have a real server running on CI, 
        # we try-except the interaction to ensure the test executes and fails gracefully 
        # or asserts correctly depending on the app's state.
        try:
            auth_page.login(email, password)
            assert not auth_page.is_logged_in(), f"Should not login with {email}"
        except Exception as e:
            # We fail the test to demonstrate screenshot capture and red Excel rows
            pytest.fail(f"Login elements not found or exception occurred: {e}")
            
    @allure.story("Google OAuth Initiation")
    @pytest.mark.auth
    def test_google_oauth_button(self, driver):
        auth_page = AuthPage(driver)
        auth_page.open(Settings.BASE_URL)
        try:
            auth_page.click_google_signin()
        except:
            pytest.fail("Google Auth button missing")
