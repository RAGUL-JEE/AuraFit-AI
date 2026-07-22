import os
import datetime
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from automation.utilities.excel_reporter import generate_excel_report
from automation.utilities.custom_logger import log

# Global store for test results to feed the Excel reporter
test_results_data = []

@pytest.fixture(scope="function")
def driver(request):
    """Sets up the Selenium WebDriver instance."""
    log.info(f"Setting up driver for test: {request.node.name}")
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    # Auto-install matched chromedriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    # Make driver accessible to test class
    if request.cls:
        request.cls.driver = driver
        
    yield driver
    
    log.info(f"Tearing down driver for test: {request.node.name}")
    driver.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture screenshots on failure and collect test metrics."""
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call":
        # Determine status
        status = "Passed"
        if report.failed:
            status = "Failed"
        elif report.skipped:
            status = "Skipped"
            
        # Try to capture screenshot if failed
        screenshot_path = ""
        if report.failed:
            driver = None
            if "driver" in item.fixturenames:
                driver = item.funcargs["driver"]
            elif hasattr(item, "instance") and hasattr(item.instance, "driver"):
                driver = item.instance.driver
                
            if driver:
                screenshot_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'screenshots')
                os.makedirs(screenshot_dir, exist_ok=True)
                filename = f"{item.name}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                screenshot_path = os.path.join(screenshot_dir, filename)
                driver.save_screenshot(screenshot_path)
                log.error(f"Test failed. Screenshot saved to {screenshot_path}")
        
        # Append to global results
        test_results_data.append({
            "Test Case ID": item.name,
            "Module": item.module.__name__ if hasattr(item, 'module') else "Unknown",
            "Browser": "Chrome Headless",
            "Status": status,
            "Duration (s)": round(report.duration, 2),
            "Screenshot Path": screenshot_path,
            "Error Message": str(report.longrepr).split('\n')[-1] if report.failed else ""
        })

def pytest_sessionfinish(session, exitstatus):
    """Hook to generate the Excel report when the test session ends."""
    log.info("Test session finished. Generating Excel Report...")
    try:
        generate_excel_report(test_results_data)
    except Exception as e:
        log.error(f"Failed to generate Excel report: {e}")
