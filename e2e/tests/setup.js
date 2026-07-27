const BrowserUtil = require('../utilities/BrowserUtil');
const ActionUtil = require('../utilities/ActionUtil');
const ExcelReporter = require('../utilities/ExcelReporter');
const logger = require('../utilities/Logger');
const fs = require('fs');
const path = require('path');

let driver;
let actionUtil;

// Global Mocha Hooks
before(async function () {
    this.timeout(60000); // 60 seconds
    try {
        driver = await BrowserUtil.getDriver();
        actionUtil = new ActionUtil(driver);
    } catch (e) {
        logger.error(`Setup failed: ${e.message}`);
        throw e;
    }
});

afterEach(async function () {
    const testStatus = this.currentTest.state;
    const testName = this.currentTest.title;
    let screenshotPath = '';

    if (testStatus === 'failed') {
        logger.error(`Test Failed: ${testName}`);
        try {
            const image = await driver.takeScreenshot();
            const failureDir = path.join(__dirname, '../reports/failures');
            if (!fs.existsSync(failureDir)) fs.mkdirSync(failureDir, { recursive: true });
            
            screenshotPath = path.join(failureDir, `${testName.replace(/[^a-z0-9]/gi, '_')}.png`);
            fs.writeFileSync(screenshotPath, image, 'base64');
            
            const url = await driver.getCurrentUrl();
            ExcelReporter.addFailedTest({
                name: testName,
                reason: this.currentTest.err.message,
                screenshot: screenshotPath,
                browser: process.env.BROWSER || 'chrome',
                url: url
            });
        } catch (err) {
            logger.error(`Failed to take screenshot: ${err.message}`);
        }
    }

    ExcelReporter.addTestCase({
        id: `TC-${Date.now()}`,
        module: this.currentTest.parent.title,
        scenario: testName,
        browser: process.env.BROWSER || 'chrome',
        status: testStatus,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        duration: this.currentTest.duration || 0
    });
});

after(async function () {
    if (driver) {
        await driver.quit();
        logger.info('Browser closed.');
    }
    await ExcelReporter.generateReport();
});

module.exports = {
    getContext: () => ({ driver, actionUtil })
};
