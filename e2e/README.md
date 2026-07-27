# Selenium E2E Automation Framework

This is a production-ready End-to-End automation framework built for React applications using Node.js, Selenium WebDriver, Mocha, and Chai.

## Features
- **Dynamic Test Generation**: Parses React source components to automatically generate form validation tests based on your React code logic.
- **Page Object Model (POM)**: Organized and maintainable UI selectors and actions.
- **Advanced Reporting**: Generates both Mochawesome HTML reports and custom ExcelJS summary/log reports.
- **Cross-Browser & Headless Support**: Configurable via environment variables.

## Getting Started

1. **Install Dependencies**
   ```bash
   cd e2e
   npm install
   ```

2. **Run Tests**
   ```bash
   npm run test
   ```
   *Note: This command will automatically run the `TestGenerator` first, scanning your `src/` directory for `<form>` and `<input>` tags, creating dynamic tests under `tests/dynamic/`, and then executing all Mocha tests.*

3. **View Reports**
   - HTML Report: `reports/mochawesome.html`
   - Excel Report: `reports/E2E_Report.xlsx`

## Configuration
Update `config/selenium.config.js` or set environment variables:
- `BROWSER` (chrome, firefox, edge)
- `HEADLESS` (true, false)
- `BASE_URL` (e.g., http://localhost:3000)
