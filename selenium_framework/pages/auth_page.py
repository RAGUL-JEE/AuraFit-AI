from selenium.webdriver.common.by import By
from .base_page import BasePage

class AuthPage(BasePage):
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[name='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[name='password']")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    TOGGLE_MODE_BUTTON = (By.XPATH, "//button[contains(text(), 'Sign Up') or contains(text(), 'Login')]")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".text-red-400")

    def __init__(self, driver):
        super().__init__(driver)

    def login(self, email, password):
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.SUBMIT_BUTTON)

    def register(self, email, password):
        # By default it might be on Login, toggle to Sign Up
        # Wait, how to know if we need to toggle? Check if "Sign In" is present.
        # Let's just click toggle button if we are in Login mode.
        # The form title is an h2. If "Welcome Back" is visible, click toggle.
        try:
            if self.is_visible((By.XPATH, "//h2[contains(text(), 'Welcome Back')]")):
                self.click(self.TOGGLE_MODE_BUTTON)
        except:
            pass
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.SUBMIT_BUTTON)

    def get_error_message(self):
        return self.get_text(self.ERROR_MESSAGE) if self.is_visible(self.ERROR_MESSAGE) else ""
