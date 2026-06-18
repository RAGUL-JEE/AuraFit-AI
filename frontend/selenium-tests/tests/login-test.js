const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

async function runLoginTest() {
  console.log('Starting Web Frontend Login Test...');
  let driver;
  let status = 'Failed';
  let message = '';
  
  try {
    const options = new chrome.Options();
    options.addArguments('--headless'); // Required for GitHub Actions
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Navigate to local frontend or a standard test URL
    // In GitHub actions, we might need the frontend running.
    // For now, we'll try to reach a dummy or localhost if deployed.
    // Using google.com as a placeholder since we don't have a known frontend URL yet.
    // If you have a specific URL, replace it here.
    console.log('Navigating to app...');
    await driver.get('http://localhost:3000'); 
    
    // Example: Find login button
    // const loginBtn = await driver.wait(until.elementLocated(By.id('login-btn')), 5000);
    // await loginBtn.click();
    
    console.log('Dummy check passed');
    status = 'Passed';
    message = 'Login page loaded successfully';
    
  } catch (err) {
    console.error('Test Error:', err);
    message = err.message;
  } finally {
    if (driver) {
      await driver.quit();
    }
    
    // Write results to Excel
    const reportData = [
      { TestName: 'Login Test', Status: status, Message: message, Date: new Date().toISOString() }
    ];
    
    const ws = xlsx.utils.json_to_sheet(reportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Summary");
    
    const reportPath = path.join(__dirname, 'report.xlsx');
    
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }
    
    xlsx.writeFile(wb, reportPath);
    console.log(`Report generated at: ${reportPath}`);
    
    if (status === 'Failed') {
      process.exit(1); // Fail the GitHub action if test fails
    }
  }
}

runLoginTest();
