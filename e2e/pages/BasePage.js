const ActionUtil = require('../utilities/ActionUtil');
const WaitUtil = require('../utilities/WaitUtil');
const config = require('../config/selenium.config');
const { By } = require('selenium-webdriver');

class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.actionUtil = new ActionUtil(driver);
        this.waitUtil = new WaitUtil(driver);
    }

    async navigateTo(path = '') {
        await this.driver.get(`${config.baseUrl}${path}`);
    }

    async getPageTitle() {
        return await this.driver.getTitle();
    }
}

module.exports = BasePage;
