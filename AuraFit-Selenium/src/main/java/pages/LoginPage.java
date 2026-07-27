package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.WaitUtil;

public class LoginPage {

    WebDriver driver;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    @FindBy(name = "email")
    WebElement emailInput;

    @FindBy(name = "password")
    WebElement passwordInput;

    @FindBy(xpath = "//button[@type='submit']")
    WebElement loginBtn;
    
    @FindBy(xpath = "//button[contains(text(), 'Create an account')]")
    WebElement createAccountToggle;
    
    @FindBy(name = "fullName")
    WebElement fullNameInput;
    
    @FindBy(name = "username")
    WebElement usernameInput;

    public void enterEmail(String email) {
        WaitUtil.waitForElementVisible(emailInput).sendKeys(email);
    }

    public void enterPassword(String password) {
        WaitUtil.waitForElementVisible(passwordInput).sendKeys(password);
    }

    public void clickLogin() {
        WaitUtil.waitForElementClickable(loginBtn).click();
    }
    
    public void clickCreateAccountToggle() {
        WaitUtil.waitForElementClickable(createAccountToggle).click();
    }
    
    public void registerUser(String fullName, String username, String email, String password) {
        clickCreateAccountToggle();
        WaitUtil.waitForElementVisible(fullNameInput).sendKeys(fullName);
        WaitUtil.waitForElementVisible(usernameInput).sendKeys(username);
        enterEmail(email);
        enterPassword(password);
        clickLogin(); // It dynamically changes to Create Account
    }
    
    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickLogin();
    }
}
