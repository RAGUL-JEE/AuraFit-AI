package base;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import utilities.BrowserFactory;
import utilities.ConfigManager;
import utilities.ExcelUtil;
import utilities.ExtentReportManager;

public class TestBase {

    protected static final Logger logger = LogManager.getLogger(TestBase.class);

    @BeforeSuite
    public void globalSetup() {
        ExcelUtil.createAuditReportTemplate();
        ExtentReportManager.getInstance();
    }

    @BeforeMethod
    public void setUp() {
        String browser = ConfigManager.getProperty("browser");
        logger.info("Initializing Browser: " + browser);
        BrowserFactory.initDriver(browser);
        BrowserFactory.getDriver().get(ConfigManager.getProperty("baseUrl"));
    }

    @AfterMethod
    public void tearDown() {
        logger.info("Closing browser");
        BrowserFactory.closeDriver();
    }
}
