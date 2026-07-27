from selenium.webdriver.common.by import By
from .base_page import BasePage

class WorkoutPage(BasePage):
    WORKOUT_HEADER = (By.XPATH, "//h2[contains(text(), 'Workouts')]")
    LAUNCH_DETECTION_BTNS = (By.XPATH, "//button[contains(text(), 'Launch Detection')]")
    EXERCISE_CARDS = (By.CSS_SELECTOR, ".theme-card")

    def __init__(self, driver):
        super().__init__(driver)

    def is_workout_page_loaded(self):
        return self.is_visible(self.WORKOUT_HEADER)

    def launch_first_workout(self):
        self.click(self.LAUNCH_DETECTION_BTNS)

    def get_workout_count(self):
        if self.is_visible(self.EXERCISE_CARDS):
            return len(self.driver.find_elements(*self.EXERCISE_CARDS))
        return 0
