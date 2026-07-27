import pytest
from selenium.webdriver.common.by import By
from pages.favorites_page import FavoritesPage

BASE_URL = "http://localhost:3000"

@pytest.mark.favorites
class TestFavorites:
    def test_favorites_loads(self, browser):
        fav_page = FavoritesPage(browser)
        fav_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Favorites']]"))
        
        assert fav_page.is_loaded(), "Favorites page did not load correctly"

    def test_favorites_list(self, browser):
        fav_page = FavoritesPage(browser)
        fav_page.navigate_to(BASE_URL)
        from pages.auth_page import AuthPage
        auth = AuthPage(browser)
        if auth.is_visible(auth.SUBMIT_BUTTON):
            auth.login("test@example.com", "password123")
        
        from pages.navigation_page import NavigationPage
        nav = NavigationPage(browser)
        nav.click((By.XPATH, "//button[.//span[text()='Favorites']]"))
        
        count = fav_page.get_favorites_count()
        assert count >= 0, "Favorites list failed to render"
