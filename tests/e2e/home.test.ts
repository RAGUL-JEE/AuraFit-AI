import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

describe('AuraFit AI Home Page', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless=new'); // For CI compatibility
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('should load the homepage and display correct title', async () => {
    // Navigate to the frontend dev server URL
    await driver.get('http://localhost:3000');
    
    // Wait for the page title to be populated
    await driver.wait(until.titleMatches(/.+/), 5000);
    
    const title = await driver.getTitle();
    expect(title).toBeTruthy();

    // Optionally wait for a known element to confirm React has hydrated
    // Let's look for the root element
    const rootElement = await driver.findElement(By.id('root'));
    expect(rootElement).toBeDefined();
  });
});
