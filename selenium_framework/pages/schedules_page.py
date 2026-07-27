from selenium.webdriver.common.by import By
from .base_page import BasePage

class SchedulesPage(BasePage):
    CALENDAR_VIEW = (By.XPATH, "//h2[contains(text(), 'Workout Schedule')]")
    ADD_SCHEDULE_BTN = (By.XPATH, "//button[contains(text(), 'New Log')]")

    def __init__(self, driver):
        super().__init__(driver)

    def is_loaded(self):
        return self.is_visible(self.CALENDAR_VIEW)
