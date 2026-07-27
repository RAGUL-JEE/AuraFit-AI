from selenium.webdriver.common.by import By
from .base_page import BasePage

class ProgressPage(BasePage):
    PROGRESS_CHART = (By.XPATH, "//h2[contains(text(), 'Progress')]")
    STATS_SUMMARY = (By.CSS_SELECTOR, ".recharts-wrapper")

    def __init__(self, driver):
        super().__init__(driver)

    def is_loaded(self):
        return self.is_visible(self.PROGRESS_CHART) or self.is_visible(self.STATS_SUMMARY)
