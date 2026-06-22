from selenium.webdriver.common.by import By
from .base_page import BasePage

class AIDetectionPage(BasePage):
    CAMERA_VIEW = (By.CSS_SELECTOR, "video, .camera-view")
    START_DETECTION_BTN = (By.XPATH, "//button[contains(text(), 'Start Detection')]")
    STOP_DETECTION_BTN = (By.XPATH, "//button[contains(text(), 'Stop Detection')]")
    FEEDBACK_TEXT = (By.CSS_SELECTOR, ".ai-feedback, .pose-feedback")

    def __init__(self, driver):
        super().__init__(driver)

    def start_camera(self):
        if self.is_visible(self.START_DETECTION_BTN):
            self.click(self.START_DETECTION_BTN)

    def get_feedback(self):
        return self.get_text(self.FEEDBACK_TEXT) if self.is_visible(self.FEEDBACK_TEXT) else ""
