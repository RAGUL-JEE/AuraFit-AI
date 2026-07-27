from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from automation.utilities.custom_logger import log
from automation.config.settings import Settings

class BasePage:
    """Base Page Object encompassing common Selenium operations."""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, Settings.EXPLICIT_WAIT)
        
    def open(self, url):
        """Navigate to a URL."""
        log.info(f"Navigating to {url}")
        self.driver.get(url)
        
    def find_element(self, locator):
        """Find an element with explicit wait."""
        log.info(f"Finding element {locator}")
        try:
            return self.wait.until(EC.presence_of_element_located(locator))
        except TimeoutException:
            log.error(f"Element {locator} not found after {Settings.EXPLICIT_WAIT} seconds.")
            raise
            
    def click(self, locator):
        """Click an element."""
        log.info(f"Clicking element {locator}")
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
        
    def enter_text(self, locator, text):
        """Enter text into an input field."""
        log.info(f"Entering text '{text}' into {locator}")
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.clear()
        element.send_keys(text)
        
    def get_text(self, locator):
        """Get text from an element."""
        element = self.wait.until(EC.visibility_of_element_located(locator))
        return element.text
        
    def is_visible(self, locator):
        """Check if an element is visible."""
        try:
            self.wait.until(EC.visibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False
            
    def get_title(self):
        """Get page title."""
        return self.driver.title
