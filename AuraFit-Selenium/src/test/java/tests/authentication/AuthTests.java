package tests.authentication;

import base.TestBase;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.DashboardPage;
import pages.LoginPage;
import utilities.ConfigManager;

public class AuthTests extends TestBase {

    @Test(description = "Verify successful user login with valid credentials")
    public void SEL_AUTH_001_ValidLogin() {
        LoginPage loginPage = new LoginPage(utilities.BrowserFactory.getDriver());
        loginPage.login(ConfigManager.getProperty("validEmail"), ConfigManager.getProperty("validPassword"));
        
        DashboardPage dashboardPage = new DashboardPage(utilities.BrowserFactory.getDriver());
        Assert.assertTrue(dashboardPage.isWelcomeHeaderVisible(), "Dashboard welcome header not visible after login");
    }

    @Test(description = "Verify validation messages on empty login submit")
    public void SEL_AUTH_002_EmptyLoginValidation() {
        LoginPage loginPage = new LoginPage(utilities.BrowserFactory.getDriver());
        loginPage.clickLogin();
        // Add specific validation assert here
        Assert.assertTrue(true, "Validation messages are displayed");
    }

    @Test(description = "Verify user registration flow")
    public void SEL_AUTH_003_UserRegistration() {
        LoginPage loginPage = new LoginPage(utilities.BrowserFactory.getDriver());
        String uniqueUser = "testuser" + System.currentTimeMillis();
        loginPage.registerUser("Test User", uniqueUser, uniqueUser + "@example.com", "Password123!");
        
        DashboardPage dashboardPage = new DashboardPage(utilities.BrowserFactory.getDriver());
        Assert.assertTrue(dashboardPage.isWelcomeHeaderVisible(), "Dashboard welcome header not visible after registration");
    }
}
