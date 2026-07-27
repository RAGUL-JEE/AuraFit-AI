from selenium.webdriver.common.by import By
from .base_page import BasePage

class DashboardPage(BasePage):
    DASHBOARD_HEADER = (By.XPATH, "//*[contains(text(), 'Daily Calories') or contains(., 'Smart Fitness')]")
    START_WORKOUT_BTN = (By.XPATH, "//button[contains(., 'Workout') or contains(., 'Start')]")
    STAT_CARDS = (By.XPATH, "//div[contains(@class, 'grid-cols-2')]//div")

    def __init__(self, driver):
        super().__init__(driver)

    def is_dashboard_loaded(self):
        return self.is_visible(self.DASHBOARD_HEADER)

    def start_workout(self):
        self.click(self.START_WORKOUT_BTN)

    def get_recent_activities_count(self):
        if self.is_visible(self.STAT_CARDS):
            elements = self.driver.find_elements(*self.STAT_CARDS)
            return len(elements)
        return 0
