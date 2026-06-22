import pytest
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from utils.report_generator import generate_excel_reports

test_results = []
failure_analysis = []

@pytest.fixture(scope="function")
def browser():
    chrome_options = Options()
    if os.environ.get('HEADLESS', 'true').lower() == 'true':
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

@pytest.fixture(autouse=True)
def test_metrics(request, browser):
    start_time = datetime.now()
    yield
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    test_name = request.node.name
    module = request.module.__name__
    
    if hasattr(request.node, 'rep_call'):
        status = request.node.rep_call.outcome
        error_msg = ""
        screenshot_path = ""
        
        if request.node.rep_call.failed:
            status = "failed"
            error_msg = str(request.node.rep_call.longrepr)
            
            # Take screenshot
            reports_dir = os.path.join(os.path.dirname(__file__), 'reports', 'screenshots')
            os.makedirs(reports_dir, exist_ok=True)
            screenshot_name = f"{test_name}_{datetime.now().strftime('%H%M%S')}.png"
            screenshot_path = os.path.join(reports_dir, screenshot_name)
            try:
                browser.save_screenshot(screenshot_path)
            except Exception as e:
                screenshot_path = f"Screenshot Failed: {str(e)}"
            
            failure_analysis.append({
                "Failed Test": test_name,
                "Root Cause": "Assertion Error / Timeout",
                "Error Message": error_msg[:1000],
                "Recommended Fix": "Review locator strategies and synchronization waits."
            })
            
        test_results.append({
            "Test ID": f"TC-{len(test_results) + 1}",
            "Module": module,
            "Test Name": test_name,
            "Execution Time": start_time.strftime('%Y-%m-%d %H:%M:%S'),
            "Duration (s)": duration,
            "Status": status.upper(),
            "Failure Reason": error_msg[:200] if error_msg else "",
            "Screenshot Path": screenshot_path
        })
    elif hasattr(request.node, 'rep_setup') and request.node.rep_setup.failed:
        test_results.append({
            "Test ID": f"TC-{len(test_results) + 1}",
            "Module": module,
            "Test Name": test_name,
            "Execution Time": start_time.strftime('%Y-%m-%d %H:%M:%S'),
            "Duration (s)": duration,
            "Status": "SETUP_FAILED",
            "Failure Reason": str(request.node.rep_setup.longrepr)[:200],
            "Screenshot Path": ""
        })

def pytest_sessionfinish(session, exitstatus):
    reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    generate_excel_reports(reports_dir, test_results, failure_analysis)
