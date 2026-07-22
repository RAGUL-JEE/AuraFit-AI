from selenium.webdriver.common.by import By

class AuthLocators:
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Sign In')]")
    GOOGLE_AUTH_BTN = (By.CSS_SELECTOR, "button.google-signin")
    ERROR_MSG = (By.CSS_SELECTOR, ".error-message")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(text(), 'Logout')]")

class DashboardLocators:
    WORKOUT_CARD = (By.CSS_SELECTOR, ".workout-card")
    CALORIES_STAT = (By.ID, "hudCalories")
    SETS_STAT = (By.ID, "hudSets")
    PROGRESS_STAT = (By.ID, "hudProgress")
    START_WORKOUT_BTN = (By.XPATH, "//button[contains(text(), 'Start')]")
    STOP_WORKOUT_BTN = (By.XPATH, "//button[contains(text(), 'Stop')]")
    VIDEO_FEED = (By.CSS_SELECTOR, "img[src='/video']")
