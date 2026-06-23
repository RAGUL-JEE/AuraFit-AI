import pytest
import os
import allure
from appium import webdriver
from appium.options.android import UiAutomator2Options
from utils.excel_reporter import excel_reporter
import time

@pytest.fixture(scope="session")
def driver():
    # Setup capabilities for Android Emulator
    options = UiAutomator2Options()
    options.platform_name = 'Android'
    options.automation_name = 'UiAutomator2'
    options.device_name = 'Android Emulator'
    options.app_package = 'com.aurafit.ai' # Replace with actual
    options.app_activity = '.MainActivity' # Replace with actual
    options.auto_grant_permissions = True
    options.no_reset = False
    
    # In GitHub Actions or local, ensure Appium server is running on 4723
    appium_server_url = 'http://127.0.0.1:4723'
    
    try:
        driver = webdriver.Remote(appium_server_url, options=options)
        driver.implicitly_wait(10)
        yield driver
    except Exception as e:
        print(f"Failed to initialize Appium driver: {e}")
        yield None
    finally:
        if 'driver' in locals() and driver:
            driver.quit()
        # Generate Excel reports at the end of the session
        excel_reporter.generate_reports()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

@pytest.fixture(autouse=True)
def report_test_execution(request, driver):
    start_time = time.time()
    yield
    duration = time.time() - start_time
    
    # Get test info
    test_id = request.node.name
    module_marker = [m.name for m in request.node.iter_markers()]
    module = module_marker[0] if module_marker else "Uncategorized"
    
    rep = getattr(request.node, "rep_call", None)
    if rep:
        status = rep.outcome
        error_message = str(rep.longrepr) if rep.failed else ""
        screenshot_path = ""
        
        # Take screenshot on failure
        if rep.failed and driver:
            screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports', 'screenshots')
            os.makedirs(screenshots_dir, exist_ok=True)
            screenshot_name = f"{test_id}_{int(time.time())}.png"
            screenshot_path = os.path.join(screenshots_dir, screenshot_name)
            driver.save_screenshot(screenshot_path)
            allure.attach.file(screenshot_path, name="Screenshot on Failure", attachment_type=allure.attachment_type.PNG)
            
        excel_reporter.add_result(
            test_id=test_id,
            module=module,
            test_name=request.node.originalname or test_id,
            duration=duration,
            status=status,
            error_message=error_message,
            screenshot_path=screenshot_path
        )
