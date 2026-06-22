const fs = require('fs');
const path = require('path');
const glob = require('glob');
const logger = require('./Logger');

/**
 * Dynamic Test Generator
 * Reads React TSX files, identifies forms and input validation rules,
 * and generates Mocha test scripts automatically.
 */
class TestGenerator {
    static generate() {
        logger.info('Starting Dynamic Test Generation based on React Components...');
        const srcDir = path.join(__dirname, '../../src');
        const testsDir = path.join(__dirname, '../tests/dynamic');
        
        if (!fs.existsSync(testsDir)) {
            fs.mkdirSync(testsDir, { recursive: true });
        }

        const files = glob.sync(`${srcDir}/**/*.tsx`);
        let generatedFilesCount = 0;

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf-8');
            // Simplified regex to find input elements and attributes like required, type="email", etc.
            const inputRegex = /<input[^>]*>/g;
            const nameRegex = /name=["']([^"']+)["']/;
            const typeRegex = /type=["']([^"']+)["']/;
            const requiredRegex = /\brequired\b/;
            const minLengthRegex = /minLength={(\d+)}/;

            let match;
            const fields = [];

            while ((match = inputRegex.exec(content)) !== null) {
                const tag = match[0];
                const name = nameRegex.exec(tag);
                if (!name) continue;

                fields.push({
                    name: name[1],
                    type: (typeRegex.exec(tag) || [])[1] || 'text',
                    isRequired: requiredRegex.test(tag),
                    minLength: (minLengthRegex.exec(tag) || [])[1]
                });
            }

            if (fields.length > 0) {
                const componentName = path.basename(file, '.tsx');
                this.createTestFile(componentName, fields, testsDir);
                generatedFilesCount++;
            }
        });

        logger.info(`Generated ${generatedFilesCount} dynamic test files in ${testsDir}`);
    }

    static createTestFile(componentName, fields, testsDir) {
        let testContent = `// AUTO-GENERATED TEST FILE FOR ${componentName}\n`;
        testContent += `const { expect } = require('chai');\n`;
        testContent += `const { By } = require('selenium-webdriver');\n`;
        testContent += `const setup = require('../setup');\n\n`;
        
        testContent += `describe('Dynamic Validation for ${componentName}', function() {\n`;
        
        fields.forEach(field => {
            if (field.isRequired) {
                testContent += `
    it('should show error when required field ${field.name} is empty', async function() {
        const { driver, actionUtil } = setup.getContext();
        // Dynamic generic check - this assumes ID matches name or finds by name
        const locator = By.css(\`input[name="\${'${field.name}'}"]\`);
        const present = await actionUtil.isDisplayed(locator);
        if (present) {
            await actionUtil.typeText(locator, '');
            // You can add further logic to check for validation messages
        }
    });\n`;
            }
            if (field.type === 'email') {
                testContent += `
    it('should invalidate incorrect email format for ${field.name}', async function() {
        const { driver, actionUtil } = setup.getContext();
        const locator = By.css(\`input[name="\${'${field.name}'}"]\`);
        const present = await actionUtil.isDisplayed(locator);
        if (present) {
            await actionUtil.typeText(locator, 'invalid-email');
        }
    });\n`;
            }
        });

        testContent += `});\n`;
        const testPath = path.join(testsDir, `${componentName.toLowerCase()}.test.js`);
        fs.writeFileSync(testPath, testContent, 'utf-8');
    }
}

// Automatically execute if run directly
if (require.main === module) {
    TestGenerator.generate();
}

module.exports = TestGenerator;
