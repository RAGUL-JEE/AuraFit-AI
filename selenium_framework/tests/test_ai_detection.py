import pytest
from pages.ai_detection_page import AIDetectionPage

BASE_URL = "http://localhost:3000"

@pytest.mark.ai
class TestAIDetection:
    def test_ai_detection_page_loads(self, browser):
        ai_page = AIDetectionPage(browser)
        ai_page.navigate_to(f"{BASE_URL}/detection")
        # Just ensure we can navigate without crash
        assert "Exception" not in browser.page_source

    def test_start_camera(self, browser):
        ai_page = AIDetectionPage(browser)
        ai_page.navigate_to(f"{BASE_URL}/detection")
        ai_page.start_camera()
        assert True, "Camera start triggered without error"
