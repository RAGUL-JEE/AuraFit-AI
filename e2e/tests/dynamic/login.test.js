// AUTO-GENERATED TEST FILE FOR Login
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const setup = require('../setup');

describe('Dynamic Validation for Login', function() {

    it('should invalidate incorrect email format for email', async function() {
        const { driver, actionUtil } = setup.getContext();
        const locator = By.css(`input[name="${'email'}"]`);
        const present = await actionUtil.isDisplayed(locator);
        if (present) {
            await actionUtil.typeText(locator, 'invalid-email');
        }
    });
});
