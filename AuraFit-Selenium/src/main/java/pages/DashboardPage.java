package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.WaitUtil;

public class DashboardPage {

    WebDriver driver;

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    @FindBy(xpath = "//h1[contains(text(), 'Welcome')]")
    WebElement welcomeHeader;
    
    @FindBy(xpath = "//a[@href='/profile']")
    WebElement profileLink;
    
    @FindBy(xpath = "//a[@href='/workouts']")
    WebElement workoutsLink;
    
    @FindBy(xpath = "//a[@href='/progress']")
    WebElement progressLink;
    
    @FindBy(xpath = "//button[contains(text(), 'Log Out')]")
    WebElement logoutBtn;

    public boolean isWelcomeHeaderVisible() {
        return WaitUtil.waitForElementVisible(welcomeHeader).isDisplayed();
    }
    
    public void goToProfile() {
        WaitUtil.waitForElementClickable(profileLink).click();
    }
    
    public void goToWorkouts() {
        WaitUtil.waitForElementClickable(workoutsLink).click();
    }
    
    public void logout() {
        WaitUtil.waitForElementClickable(logoutBtn).click();
    }
}
