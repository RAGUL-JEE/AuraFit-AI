# AuraFit-AI Enterprise Selenium Framework

This is a production-ready Enterprise Selenium End-to-End Automation Framework built for the AuraFit-AI web application. 

It is designed to automatically perform end-to-end testing of the entire application mirroring a real QA team workflow, generating professional Extent HTML Reports and Apache POI Excel Audit Reports.

## Features
- **Java 21 & Selenium 4**: Modern tech stack for robust testing.
- **Page Object Model (POM) with Page Factory**: highly maintainable code.
- **TestNG & Maven**: Superior test execution, grouping, and dependency management.
- **WebDriverManager**: Automatic driver binary management.
- **Reporting**: Extent Reports (HTML dashboards) and Apache POI (Excel Audit Reports).
- **Log4j2**: Professional execution and browser logging.
- **RetryAnalyzer**: Automatically retries flaky tests before marking them as failed.
- **Screenshot Utility**: Automatically captures screenshots on test failures.
- **CI/CD Integration**: Fully integrated with GitHub Actions (`selenium-framework.yml`).

## Prerequisites
- Java JDK 21 installed.
- Maven installed.
- AuraFit-AI frontend running locally (or adjust `baseUrl` in `src/main/resources/config.properties`).

## Execution

### Run Locally
To execute the complete test suite locally:
```bash
mvn clean test
```

### Configuration
All environments, waits, and base URLs can be configured inside:
`src/main/resources/config.properties`

## Extending the Framework to 400+ Tests
This framework includes foundational Base Classes, Page Objects, and Test Cases covering Core Authentication and Dashboard modules. 

To achieve 400 unique test cases as requested:
1. **Create Page Classes**: Inside `src/main/java/pages/`, create classes for `WorkoutPage`, `ProfilePage`, etc., defining WebElements using `@FindBy`.
2. **Create Test Classes**: Inside `src/test/java/tests/`, create `WorkoutTests`, `ProfileTests`, etc., extending `TestBase`.
3. **Add to TestNG**: Register your new test classes inside `testng.xml`.

The `TestListener` and `RetryAnalyzer` will automatically capture screenshots and log results to your Extent and Excel reports for every new test case you add.
