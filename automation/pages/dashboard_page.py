from automation.pages.base_page import BasePage
from automation.locators.locators import DashboardLocators

class DashboardPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        
    def start_workout(self):
        self.click(DashboardLocators.START_WORKOUT_BTN)
        
    def stop_workout(self):
        self.click(DashboardLocators.STOP_WORKOUT_BTN)
        
    def get_calories(self):
        return self.get_text(DashboardLocators.CALORIES_STAT)
        
    def is_video_feed_active(self):
        return self.is_visible(DashboardLocators.VIDEO_FEED)
