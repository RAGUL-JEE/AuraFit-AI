package utilities;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class WaitUtil {

    private static int defaultWaitTime = Integer.parseInt(ConfigManager.getProperty("explicitWait"));

    public static WebElement waitForElementVisible(WebElement element) {
        WebDriverWait wait = new WebDriverWait(BrowserFactory.getDriver(), Duration.ofSeconds(defaultWaitTime));
        return wait.until(ExpectedConditions.visibilityOf(element));
    }

    public static WebElement waitForElementClickable(WebElement element) {
        WebDriverWait wait = new WebDriverWait(BrowserFactory.getDriver(), Duration.ofSeconds(defaultWaitTime));
        return wait.until(ExpectedConditions.elementToBeClickable(element));
    }

    public static void waitForUrlContains(String text) {
        WebDriverWait wait = new WebDriverWait(BrowserFactory.getDriver(), Duration.ofSeconds(defaultWaitTime));
        wait.until(ExpectedConditions.urlContains(text));
    }
}
