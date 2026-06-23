import pytest
import allure
from pages.dashboard_page import DashboardPage

@pytest.mark.dashboard
@allure.feature('Dashboard')
class TestDashboard:
    
    @allure.story('Dashboard Loading')
    def test_dashboard_elements(self, driver):
        # Assuming user is already logged in or state is mocked
        dashboard_page = DashboardPage(driver)
        
        assert dashboard_page.is_dashboard_loaded(), "Dashboard title not found"
        calories = dashboard_page.get_calories_burned()
        assert calories is not None, "Calories card missing"
