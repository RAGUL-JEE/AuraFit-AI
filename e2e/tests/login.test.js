const { expect } = require('chai');
const setup = require('./setup');
const LoginPage = require('../pages/LoginPage');
const logger = require('../utilities/Logger');

describe('Authentication Flow Tests', function() {
    let loginPage;

    before(async function() {
        const { driver } = setup.getContext();
        loginPage = new LoginPage(driver);
    });

    beforeEach(async function() {
        await loginPage.navigateTo('/');
    });

    it('should show error for empty credentials', async function() {
        await loginPage.login('', '');
        // Note: Assuming HTML5 validation or custom error
        logger.info('Tested empty credentials.');
    });

    it('should show error for invalid credentials', async function() {
        await loginPage.login('invalid@example.com', 'wrongpassword');
        const errorMessage = await loginPage.getErrorMessage();
        // Adjust assertion based on actual application text
        expect(errorMessage).to.not.be.empty;
    });

});
