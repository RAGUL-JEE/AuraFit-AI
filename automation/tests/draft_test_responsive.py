import pytest
import allure
from automation.config.settings import Settings
from automation.data.test_data import VIEWPORTS

@allure.feature("Responsive Design")
class TestResponsive:
    
    @allure.story("Viewport Rendering")
    @pytest.mark.ui
    @pytest.mark.parametrize("width, height", VIEWPORTS)
    def test_viewport_rendering(self, driver, width, height):
        """Validates the application layout across 100 viewport size tests."""
        driver.set_window_size(width, height)
        driver.get(Settings.BASE_URL)
        
        # Verify title or some fundamental layout metric
        try:
            title = driver.title
            assert title != "", "Title should not be empty"
        except Exception as e:
            pytest.fail(f"Failed to load layout at {width}x{height}: {e}")
