const WaitUtil = require('./WaitUtil');
const logger = require('./Logger');

class ActionUtil {
    constructor(driver) {
        this.driver = driver;
        this.waitUtil = new WaitUtil(driver);
    }

    async click(locator) {
        try {
            const element = await this.waitUtil.waitForElementClickable(locator);
            await element.click();
            logger.info(`Clicked element: ${locator}`);
        } catch (error) {
            logger.error(`Failed to click element ${locator}: ${error.message}`);
            throw error;
        }
    }

    async typeText(locator, text) {
        try {
            const element = await this.waitUtil.waitForElementVisible(locator);
            await element.clear();
            await element.sendKeys(text);
            logger.info(`Typed text into ${locator}`);
        } catch (error) {
            logger.error(`Failed to type into ${locator}: ${error.message}`);
            throw error;
        }
    }

    async getText(locator) {
        try {
            const element = await this.waitUtil.waitForElementVisible(locator);
            const text = await element.getText();
            logger.info(`Got text "${text}" from ${locator}`);
            return text;
        } catch (error) {
            logger.error(`Failed to get text from ${locator}: ${error.message}`);
            throw error;
        }
    }

    async clickWithJS(locator) {
        try {
            const element = await this.waitUtil.waitForElementPresent(locator);
            await this.driver.executeScript("arguments[0].click();", element);
            logger.info(`Clicked element with JS: ${locator}`);
        } catch (error) {
            logger.error(`Failed JS click on ${locator}: ${error.message}`);
            throw error;
        }
    }

    async scrollToElement(locator) {
        try {
            const element = await this.waitUtil.waitForElementPresent(locator);
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
            logger.info(`Scrolled to element: ${locator}`);
        } catch (error) {
            logger.error(`Failed scrolling to ${locator}: ${error.message}`);
            throw error;
        }
    }

    async isDisplayed(locator) {
        try {
            const element = await this.waitUtil.waitForElementPresent(locator, 3000);
            return await element.isDisplayed();
        } catch (error) {
            return false;
        }
    }
}

module.exports = ActionUtil;
