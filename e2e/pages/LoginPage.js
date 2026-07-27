const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Locators
        this.emailInput = By.css('input[type="email"]');
        this.passwordInput = By.css('input[type="password"]');
        this.loginButton = By.xpath('//button[contains(text(), "Login") or contains(text(), "Sign In")]');
        this.errorMessage = By.css('.text-red-500, .error-message');
    }

    async login(email, password) {
        if (email) await this.actionUtil.typeText(this.emailInput, email);
        if (password) await this.actionUtil.typeText(this.passwordInput, password);
        await this.actionUtil.click(this.loginButton);
    }

    async getErrorMessage() {
        return await this.actionUtil.getText(this.errorMessage);
    }
}

module.exports = LoginPage;
