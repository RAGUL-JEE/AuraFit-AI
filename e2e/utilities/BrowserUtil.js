const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config/selenium.config');
const logger = require('./Logger');

class BrowserUtil {
    static async getDriver() {
        let driver;
        logger.info(`Initializing browser: ${config.browser} (Headless: ${config.headless})`);
        
        try {
            switch (config.browser.toLowerCase()) {
                case 'firefox':
                    let firefoxOptions = new firefox.Options();
                    if (config.headless) firefoxOptions.addArguments('-headless');
                    driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(firefoxOptions).build();
                    break;
                case 'edge':
                    let edgeOptions = new edge.Options();
                    if (config.headless) edgeOptions.addArguments('--headless');
                    driver = await new Builder().forBrowser(Browser.EDGE).setEdgeOptions(edgeOptions).build();
                    break;
                case 'chrome':
                default:
                    let chromeOptions = new chrome.Options();
                    if (config.headless) chromeOptions.addArguments('--headless', '--disable-gpu', '--window-size=1920,1080');
                    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).build();
                    break;
            }

            await driver.manage().setTimeouts({
                implicit: config.implicitWait,
                pageLoad: config.pageLoadTimeout,
                script: config.scriptTimeout
            });

            if (!config.headless) {
                await driver.manage().window().maximize();
            }

            logger.info('Browser initialized successfully.');
            return driver;
        } catch (error) {
            logger.error(`Failed to initialize browser: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BrowserUtil;
