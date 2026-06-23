from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage

class DashboardPage(BasePage):
    DASHBOARD_TITLE = (AppiumBy.ACCESSIBILITY_ID, "dashboard-title")
    CALORIES_CARD = (AppiumBy.ACCESSIBILITY_ID, "calories-burned-card")
    WORKOUTS_CARD = (AppiumBy.ACCESSIBILITY_ID, "workouts-done-card")
    START_WORKOUT_BTN = (AppiumBy.ACCESSIBILITY_ID, "start-workout-nav-btn")

    def __init__(self, driver):
        super().__init__(driver)

    def is_dashboard_loaded(self):
        return self.is_element_displayed(self.DASHBOARD_TITLE)

    def get_calories_burned(self):
        return self.get_text(self.CALORIES_CARD)

    def navigate_to_workout(self):
        self.click(self.START_WORKOUT_BTN)
