from selenium.webdriver.common.by import By
from .base_page import BasePage

class ProfilePage(BasePage):
    PROFILE_HEADER = (By.XPATH, "//h2[contains(text(), 'Settings') or contains(text(), 'Profile')]")
    EDIT_PROFILE_BTN = (By.XPATH, "//button[contains(text(), 'Edit')]")
    LOGOUT_BTN = (By.XPATH, "//button[.//span[text()='Logout']]")

    def __init__(self, driver):
        super().__init__(driver)

    def is_loaded(self):
        return self.is_visible(self.PROFILE_HEADER)

    def logout(self):
        self.click(self.LOGOUT_BTN)
