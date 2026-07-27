from automation.pages.base_page import BasePage
from automation.locators.locators import AuthLocators

class AuthPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        
    def login(self, email, password):
        self.enter_text(AuthLocators.EMAIL_INPUT, email)
        self.enter_text(AuthLocators.PASSWORD_INPUT, password)
        self.click(AuthLocators.LOGIN_BUTTON)
        
    def click_google_signin(self):
        self.click(AuthLocators.GOOGLE_AUTH_BTN)
        
    def get_error_message(self):
        if self.is_visible(AuthLocators.ERROR_MSG):
            return self.get_text(AuthLocators.ERROR_MSG)
        return ""
        
    def is_logged_in(self):
        return self.is_visible(AuthLocators.LOGOUT_BUTTON)
