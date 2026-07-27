package listeners;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import utilities.ExcelUtil;
import utilities.ExtentReportManager;
import utilities.ScreenshotUtil;

public class TestListener implements ITestListener {

    private static ThreadLocal<ExtentTest> extentTest = new ThreadLocal<>();

    @Override
    public void onStart(ITestContext context) {
        // Handled in TestBase BeforeSuite
    }

    @Override
    public void onTestStart(ITestResult result) {
        ExtentTest test = ExtentReportManager.createTest(result.getMethod().getMethodName());
        extentTest.set(test);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        extentTest.get().log(Status.PASS, "Test Passed");
        logToExcel(result, "PASS", "");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String screenshotPath = ScreenshotUtil.captureScreenshot(result.getMethod().getMethodName());
        extentTest.get().log(Status.FAIL, "Test Failed");
        extentTest.get().log(Status.FAIL, result.getThrowable());
        extentTest.get().addScreenCaptureFromPath(screenshotPath);
        
        logToExcel(result, "FAIL", screenshotPath);
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        extentTest.get().log(Status.SKIP, "Test Skipped");
        logToExcel(result, "SKIP", "");
    }

    @Override
    public void onFinish(ITestContext context) {
        ExtentReportManager.flushReport();
    }

    private void logToExcel(ITestResult result, String status, String screenshotPath) {
        String testName = result.getMethod().getMethodName();
        String description = result.getMethod().getDescription();
        String duration = String.valueOf(result.getEndMillis() - result.getStartMillis()) + " ms";
        
        // "Test Case ID", "Module", "Feature", "Scenario", "Priority", "Severity", "Browser", "Expected Result", "Actual Result", "Status", "Execution Time", "Screenshot Path", "Remarks"
        String[] data = {
                testName,
                "Module Placeholder",
                "Feature Placeholder",
                description != null ? description : testName,
                "High",
                "High",
                "Chrome", // Simplified for demo
                "Action should succeed",
                status.equals("PASS") ? "Action succeeded" : "Action failed",
                status,
                duration,
                screenshotPath,
                ""
        };
        ExcelUtil.logTestResult(data);
    }
}
