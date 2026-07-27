from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage

class LoginPage(BasePage):
    # Locators (To be updated with actual Accessibility IDs or XPaths from the app)
    EMAIL_INPUT = (AppiumBy.ACCESSIBILITY_ID, "login-email-input")
    PASSWORD_INPUT = (AppiumBy.ACCESSIBILITY_ID, "login-password-input")
    LOGIN_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "login-submit-button")
    GOOGLE_LOGIN_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "google-login-button")
    ERROR_MESSAGE = (AppiumBy.ACCESSIBILITY_ID, "login-error-message")

    def __init__(self, driver):
        super().__init__(driver)

    def login(self, email, password):
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

    def login_with_google(self):
        self.click(self.GOOGLE_LOGIN_BUTTON)

    def is_error_displayed(self):
        return self.is_element_displayed(self.ERROR_MESSAGE)

    def get_error_message(self):
        return self.get_text(self.ERROR_MESSAGE)
