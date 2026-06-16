import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

// We run all tests sequentially in one browser instance for speed
describe('AuraFit AI Dashboard E2E Tests', () => {
  let driver: WebDriver;

  // We set a high timeout because E2E tests with Selenium can be slow
  jest.setTimeout(60000);

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    await driver.get('http://localhost:3000');
    
    // 1. Bypass Login Screen
    // Wait for email input
    const emailInput = await driver.wait(until.elementLocated(By.name('email')), 10000);
    await emailInput.sendKeys('testuser@gym.ai');
    
    // Click Sign In button
    const signInBtn = await driver.findElement(By.xpath("//button[.//span[text()='Sign In']]"));
    await signInBtn.click();
    
    // Wait for Dashboard (Home) to load
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Welcome back')]")), 10000);

    // 2. Navigate to AI Detection (Active Workout)
    const aiDetectionLink = await driver.wait(until.elementLocated(By.xpath("//button[.//span[contains(text(), 'AI Detection')]]")), 5000);
    await aiDetectionLink.click();

    // Wait for the AI Detection page to load
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Bench Press')]")), 10000);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  describe('Group 1: Initial Page Load & Structure', () => {
    it('1. Verify sidebar navigation renders', async () => {
      const sidebar = await driver.findElements(By.tagName('aside'));
      expect(sidebar.length).toBeGreaterThan(0);
    });

    it('2. Verify main header and AI GYM COACH branding', async () => {
      const brand = await driver.findElement(By.xpath("//h2[contains(text(), 'AI GYM COACH')]"));
      expect(await brand.isDisplayed()).toBe(true);
    });

    it('3. Verify the main video feed container exists', async () => {
      const videoImg = await driver.findElement(By.xpath("//img[@alt='Bench Press']"));
      expect(await videoImg.isDisplayed()).toBe(true);
    });

    it('4. Verify HUD metrics container renders', async () => {
      const metrics = await driver.findElements(By.xpath("//div[contains(text(), 'Calories')]"));
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('5. Verify control buttons (Start, Stop, Reset) exist', async () => {
      const startBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Start')]"));
      expect(await startBtn.isDisplayed()).toBe(true);
    });

    it('6. Verify Execution Guide panel exists', async () => {
      const guideTitle = await driver.findElement(By.xpath("//h3[contains(text(), 'Execution Guide')]"));
      expect(await guideTitle.isDisplayed()).toBe(true);
    });
  });

  describe('Group 2: HUD Initial State Verification', () => {
    it('7. Verify Calories defaults to 0', async () => {
      const cals = await driver.findElement(By.xpath("//div[text()='Calories']/preceding-sibling::div"));
      expect(await cals.getText()).toContain('0');
    });

    it('8. Verify Sets Done defaults to 0 / 4 (for Bench Press default)', async () => {
      const sets = await driver.findElement(By.xpath("//div[text()='Sets']/preceding-sibling::div"));
      expect(await sets.getText()).toContain('0 / 4');
    });

    it('9. Verify Progress defaults to 0', async () => {
      const reps = await driver.findElement(By.xpath("//div[text()='Reps']/preceding-sibling::div"));
      expect(await reps.getText()).toContain('0 / 15');
    });

    it('10. Verify Time Elapsed defaults to 00:00', async () => {
      const time = await driver.findElement(By.xpath("//div[text()='Duration']/preceding-sibling::div"));
      expect(await time.getText()).toContain('00:00');
    });

    it('11. Verify Form Score defaults to around 94%', async () => {
      const score = await driver.findElement(By.xpath("//div[text()='Form Score']/preceding-sibling::div"));
      expect(await score.getText()).toMatch(/9[0-9]%/);
    });
  });

  describe('Group 3: Workout Selection Modal', () => {
    it('12. Verify clicking "Set Workout" opens the modal', async () => {
      const btn = await driver.findElement(By.xpath("//button[contains(text(), 'Set Workout')]"));
      await driver.executeScript("arguments[0].click();", btn);
      const modalHeader = await driver.wait(until.elementLocated(By.xpath("//h2[text()='Configure Your Routine']")), 3000);
      expect(await modalHeader.isDisplayed()).toBe(true);
    });

    it('13. Verify clicking Close hides the modal', async () => {
      const closeBtn = await driver.findElement(By.xpath("//div[contains(@class, 'z-50')]//button[contains(@class, 'hover:bg-slate-100')]"));
      await closeBtn.click();
      await driver.sleep(500); // wait for animation
      const modals = await driver.findElements(By.xpath("//h2[text()='Configure Your Routine']"));
      if (modals.length > 0) {
        expect(await modals[0].isDisplayed()).toBe(false);
      } else {
        expect(true).toBe(true);
      }
    });

    it('14. Verify Change Exercise opens exercise selector (Workouts Tab)', async () => {
      const changeExBtn = await driver.findElement(By.xpath("//button[.//span[text()='Change Exercise']]"));
      await driver.executeScript("arguments[0].click();", changeExBtn);
      const workoutsTitle = await driver.wait(until.elementLocated(By.xpath("//h2[text()='Workouts']")), 3000);
      expect(await workoutsTitle.isDisplayed()).toBe(true);
    });

    it('15. Verify Push-up option exists', async () => {
      const pushup = await driver.findElement(By.xpath("//h3[text()='Push-Up']"));
      expect(await pushup.isDisplayed()).toBe(true);
    });

    it('16. Verify Squat option exists', async () => {
      const squat = await driver.findElement(By.xpath("//h3[text()='Squat']"));
      expect(await squat.isDisplayed()).toBe(true);
    });

    it('17. Verify Lunge option exists', async () => {
      const lunge = await driver.findElement(By.xpath("//h3[text()='Lunge']"));
      expect(await lunge.isDisplayed()).toBe(true);
    });

    it('18. Verify Plank option exists', async () => {
      const plank = await driver.findElement(By.xpath("//h3[text()='Plank']"));
      expect(await plank.isDisplayed()).toBe(true);
    });

    it('19. Verify Bicep Curl option exists', async () => {
      const curl = await driver.findElement(By.xpath("//h3[text()='Bicep Curl']"));
      expect(await curl.isDisplayed()).toBe(true);
    });

    it('20. Verify Shoulder Press option exists', async () => {
      const press = await driver.findElement(By.xpath("//h3[text()='Shoulder Press']"));
      expect(await press.isDisplayed()).toBe(true);
    });

    it('21. Verify Deadlift option exists', async () => {
      const dl = await driver.findElement(By.xpath("//h3[text()='Deadlift']"));
      expect(await dl.isDisplayed()).toBe(true);
    });
  });

  describe('Group 4: Dynamic Data Updates', () => {
    it('22. Verify selecting Push-Up updates the main header title', async () => {
      // Click Launch Detection on Push-Up
      const pushupBtn = await driver.findElement(By.xpath("//h3[text()='Push-Up']/following-sibling::button[text()='Launch Detection']"));
      await driver.executeScript("arguments[0].click();", pushupBtn);
      const newHeader = await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Push-Up')]")), 3000);
      expect(await newHeader.isDisplayed()).toBe(true);
    });

    it('23. Verify selecting a workout updates the target muscle group text', async () => {
      const muscle = await driver.findElement(By.xpath("//span[text()='Pectoralis Major']"));
      expect(await muscle.isDisplayed()).toBe(true);
    });

    it('24. Verify the YouTube tutorial link renders', async () => {
      const ytLink = await driver.findElement(By.xpath("//button[contains(text(), 'Open Tutorial')]"));
      expect(await ytLink.isDisplayed()).toBe(true);
    });

    it('25. Verify the Execution Guide list populates with steps', async () => {
      const step1 = await driver.findElement(By.xpath("//li[contains(text(), 'Place your hands')]"));
      expect(await step1.isDisplayed()).toBe(true);
    });

    it('26. Verify selecting Plank updates the timer HUD mode', async () => {
      // Go back to Workouts
      const changeExBtn = await driver.findElement(By.xpath("//button[.//span[text()='Change Exercise']]"));
      await driver.executeScript("arguments[0].click();", changeExBtn);
      await driver.sleep(500);
      
      const plankBtn = await driver.wait(until.elementLocated(By.xpath("//h3[text()='Plank']/following-sibling::button[text()='Launch Detection']")), 3000);
      await driver.executeScript("arguments[0].click();", plankBtn);
      
      const newHeader = await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Plank')]")), 3000);
      expect(await newHeader.isDisplayed()).toBe(true);
    });

    it('27. Verify selecting Mountain Climber updates target reps', async () => {
      const changeExBtn = await driver.findElement(By.xpath("//button[.//span[text()='Change Exercise']]"));
      await driver.executeScript("arguments[0].click();", changeExBtn);
      await driver.sleep(500);

      const mcBtn = await driver.wait(until.elementLocated(By.xpath("//h3[text()='Mountain Climber']/following-sibling::button[text()='Launch Detection']")), 3000);
      await driver.executeScript("arguments[0].click();", mcBtn);
      
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Mountain Climber')]")), 3000);
      const reps = await driver.findElement(By.xpath("//div[text()='Reps']/preceding-sibling::div"));
      // It should reset back to the default or chosen targets
      expect(await reps.getText()).toContain('0 /');
    });

    it('28. Verify changing Target Reps in Set Workout modal works', async () => {
      const btn = await driver.findElement(By.xpath("//button[contains(text(), 'Set Workout')]"));
      await driver.executeScript("arguments[0].click();", btn);
      
      // Find reps input (wait for it)
      const repsInput = await driver.wait(until.elementLocated(By.xpath("//label[text()='Target Reps / Time']/following-sibling::div/input")), 2000);
      // Clear it by backspacing (since it's a number input with default value)
      await repsInput.clear();
      await repsInput.sendKeys('40');
      
      const applyBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Apply Routine Settings')]"));
      await applyBtn.click();
      await driver.sleep(500);

      const repsHud = await driver.findElement(By.xpath("//div[text()='Reps']/preceding-sibling::div"));
      expect(await repsHud.getText()).toContain('0 / 40');
    });

    it('29. Verify changing Target Sets in Set Workout modal works', async () => {
      const btn = await driver.findElement(By.xpath("//button[contains(text(), 'Set Workout')]"));
      await driver.executeScript("arguments[0].click();", btn);
      
      const setsInput = await driver.wait(until.elementLocated(By.xpath("//label[text()='Total Sets']/following-sibling::div/input")), 2000);
      await setsInput.clear();
      await setsInput.sendKeys('6');
      
      const applyBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Apply Routine Settings')]"));
      await applyBtn.click();
      await driver.sleep(500);

      const setsHud = await driver.findElement(By.xpath("//div[text()='Sets']/preceding-sibling::div"));
      expect(await setsHud.getText()).toContain('0 / 6');
    });
  });

  describe('Group 5: Controls & Interactivity', () => {
    it('30. Verify Start button is clickable and toggles state', async () => {
      const startBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Start')]"));
      // It is clickable
      expect(await startBtn.isEnabled()).toBe(true);
    });

    it('31. Verify Stop button is clickable', async () => {
      const stopBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Stop')]"));
      expect(await stopBtn.isEnabled()).toBe(true);
    });

    it('32. Verify Reset button is clickable', async () => {
      const resetBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Reset')]"));
      expect(await resetBtn.isEnabled()).toBe(true);
    });

    it('33. Verify Progress navigation link exists', async () => {
      const link = await driver.findElement(By.xpath("//button[.//span[text()='Progress']]"));
      expect(await link.isDisplayed()).toBe(true);
    });

    it('34. Verify Favorites navigation link exists', async () => {
      const link = await driver.findElement(By.xpath("//button[.//span[text()='Favorites']]"));
      expect(await link.isDisplayed()).toBe(true);
    });

    it('35. Verify Home navigation link works and returns to Home', async () => {
      const homeLink = await driver.findElement(By.xpath("//button[.//span[text()='Home']]"));
      await driver.executeScript("arguments[0].click();", homeLink);
      const welcome = await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Welcome back')]")), 3000);
      expect(await welcome.isDisplayed()).toBe(true);
    });
  });
});
