from selenium.webdriver.common.by import By
from .base_page import BasePage

class FavoritesPage(BasePage):
    FAVORITES_HEADER = (By.XPATH, "//h2[contains(text(), 'Favorites')]")
    FAVORITE_ITEMS = (By.CSS_SELECTOR, ".theme-card")

    def __init__(self, driver):
        super().__init__(driver)

    def is_loaded(self):
        return self.is_visible(self.FAVORITES_HEADER)

    def get_favorites_count(self):
        if self.is_visible(self.FAVORITE_ITEMS):
            return len(self.driver.find_elements(*self.FAVORITE_ITEMS))
        return 0
