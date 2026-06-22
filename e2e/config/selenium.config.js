require('dotenv').config();

module.exports = {
    browser: process.env.BROWSER || 'chrome',
    headless: process.env.HEADLESS !== 'false',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    implicitWait: parseInt(process.env.IMPLICIT_WAIT) || 5000,
    pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT) || 30000,
    scriptTimeout: parseInt(process.env.SCRIPT_TIMEOUT) || 15000,
    retryCount: parseInt(process.env.RETRY_COUNT) || 1
};
