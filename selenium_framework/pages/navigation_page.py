from selenium.webdriver.common.by import By
from .base_page import BasePage

class NavigationPage(BasePage):
    HOME_LINK = (By.XPATH, "//button[.//span[text()='Home']]")
    WORKOUT_LINK = (By.XPATH, "//button[.//span[text()='Workouts']]")
    PROGRESS_LINK = (By.XPATH, "//button[.//span[text()='Progress']]")
    PROFILE_LINK = (By.XPATH, "//button[.//span[text()='Settings']]") # Using settings as profile replacement if no profile link exists

    def __init__(self, driver):
        super().__init__(driver)

    def go_to_home(self):
        self.click(self.HOME_LINK)

    def go_to_workout(self):
        self.click(self.WORKOUT_LINK)

    def go_to_progress(self):
        self.click(self.PROGRESS_LINK)

    def go_to_profile(self):
        self.click(self.PROFILE_LINK)
