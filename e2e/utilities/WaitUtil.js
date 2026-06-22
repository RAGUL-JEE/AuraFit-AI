const { until } = require('selenium-webdriver');
const config = require('../config/selenium.config');
const logger = require('./Logger');

class WaitUtil {
    constructor(driver) {
        this.driver = driver;
        this.timeout = config.implicitWait;
    }

    async waitForElementVisible(locator, timeout = this.timeout) {
        logger.info(`Waiting for element to be visible: ${locator}`);
        return await this.driver.wait(until.elementLocated(locator), timeout)
            .then(element => this.driver.wait(until.elementIsVisible(element), timeout));
    }

    async waitForElementClickable(locator, timeout = this.timeout) {
        logger.info(`Waiting for element to be clickable: ${locator}`);
        const element = await this.waitForElementVisible(locator, timeout);
        return await this.driver.wait(until.elementIsEnabled(element), timeout);
    }

    async waitForElementPresent(locator, timeout = this.timeout) {
        logger.info(`Waiting for element presence: ${locator}`);
        return await this.driver.wait(until.elementLocated(locator), timeout);
    }

    async sleep(ms) {
        logger.info(`Sleeping for ${ms} ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = WaitUtil;
