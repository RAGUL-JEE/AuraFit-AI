package tests.dashboard;

import base.TestBase;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.DashboardPage;
import pages.LoginPage;
import utilities.ConfigManager;

public class DashboardTests extends TestBase {

    @BeforeMethod
    public void loginBeforeTest() {
        LoginPage loginPage = new LoginPage(utilities.BrowserFactory.getDriver());
        loginPage.login(ConfigManager.getProperty("validEmail"), ConfigManager.getProperty("validPassword"));
    }

    @Test(description = "Verify dashboard navigation links")
    public void SEL_DASH_001_NavigationLinks() {
        DashboardPage dashboardPage = new DashboardPage(utilities.BrowserFactory.getDriver());
        dashboardPage.goToProfile();
        utilities.WaitUtil.waitForUrlContains("profile");
        Assert.assertTrue(utilities.BrowserFactory.getDriver().getCurrentUrl().contains("profile"), "Did not navigate to profile");
    }

    @Test(description = "Verify successful logout from dashboard")
    public void SEL_DASH_002_Logout() {
        DashboardPage dashboardPage = new DashboardPage(utilities.BrowserFactory.getDriver());
        dashboardPage.logout();
        utilities.WaitUtil.waitForUrlContains("login");
        Assert.assertTrue(utilities.BrowserFactory.getDriver().getCurrentUrl().contains("login"), "Did not navigate to login after logout");
    }
}
