# Playwright Test Automation Suite

A Playwright + TypeScript end-to-end test suite for [automationexercise.com](https://automationexercise.com), built with the Page Object Model and Allure/HTML/JUnit reporting.

## Prerequisites

- Node.js 16+
- Git

## Setup

```bash
npm install
npx playwright install
```

## Running tests

```bash
npm test                 # run the full suite (all browsers)
npm run test:headed      # run with a visible browser
npm run test:debug       # run in debug mode
npm run test:ui          # run with Playwright's UI mode
npm run test:report      # open the last HTML report
npm run test:allure      # generate + open an Allure report
```

Cross-browser / device targets:

```bash
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:mobile
npx playwright test --project=microsoft-edge
npx playwright test --project=google-chrome
```

Run just one spec file:

```bash
npm run test:original     # tests/AutomationExerciseTestSuite.spec.ts
npm run test:mcp          # tests/MCPEnhancedTestSuite.spec.ts
```

### Intentional failure demo

`tests/FailureDemo.spec.ts` contains 4 tests that **fail on purpose** (price mismatch, missing element,
wrong cart count, soft assertions) to demonstrate failure reporting — error diff, screenshot, video and trace.
It is excluded from `npm test` and runs with its own config and report folder:

```bash
npm run test:failures          # run the intentionally failing scenarios (exit code is non-zero by design)
npm run test:failures:report   # open their HTML report (playwright-report-failures/)
```

## Test suite overview

| Spec file | Tests | Covers |
|---|---|---|
| `tests/AutomationExerciseTestSuite.spec.ts` | 30 (TC01–TC30) | Registration, login/logout, contact form, product browsing/search, cart, full checkout with payment, invoice download, reviews, subscriptions, scroll behavior, plus negative scenarios (TC27–TC30) |
| `tests/MCPEnhancedTestSuite.spec.ts` | 5 (MCP-TC01–MCP-TC05) | Same core flows, run through the `MCPTestRunner` helper, which adds structured `console.log` step tracing around each action |
| `tests/FailureDemo.spec.ts` | 4 (FD01–FD04) | Intentionally failing tests for demonstrating failure reports — **not** part of the normal run |

**35 tests in the regular run.**

> **Note on "MCP" tests:** `utils/MCPTestRunner.ts` is a thin logging wrapper around standard Playwright APIs (`page.click`, `page.fill`, etc.) — it does not call out to the Model Context Protocol servers configured in `.kiro/settings/mcp.json`. Treat `MCPEnhancedTestSuite.spec.ts` as the same coverage as the main suite with extra step-by-step logging, not a separate AI-driven test mechanism. Background on the intended MCP integration is in [docs/MCP_INTEGRATION_GUIDE.md](docs/MCP_INTEGRATION_GUIDE.md).

> **Test accounts:** Tests that need an existing user (login, logout, checkout, address/invoice checks) create a fresh account through the site's public REST API (`utils/ApiHelper.ts`) and delete it after the test. No credentials need to be configured.

> **Ad blocking:** `blockAds()` aborts Google ad/analytics requests in each test. The live site's ads can overlay the page and are the main source of flakiness.

## Project structure

```
playwright.config.ts          # Playwright configuration (browsers, reporters, baseURL)
tsconfig.json                 # TypeScript configuration
package.json                  # Dependencies and npm scripts
pages/                        # Page Object Model
  BasePage.ts                 # Shared navigation/interaction helpers
  HomePage.ts
  LoginPage.ts
  RegistrationPage.ts
  MyAccountPage.ts
  ProductsPage.ts
  ProductDetailsPage.ts
  CartPage.ts
  ContactUsPage.ts
  CheckoutPage.ts
  PaymentPage.ts
  TestCasesPage.ts
tests/                        # Test specs
  AutomationExerciseTestSuite.spec.ts
  MCPEnhancedTestSuite.spec.ts
  FailureDemo.spec.ts         # Intentionally failing demo tests (npm run test:failures)
playwright.failure-demo.config.ts  # Config used only by the failure demo
utils/
  TestDataProvider.ts         # Test data generation/fixtures
  ApiHelper.ts                # REST API account create/delete + ad blocking
  MCPTestRunner.ts            # Logging wrapper used by the MCP spec (see note above)
docs/                         # Supplementary learning material (not required to run the suite)
  MCP_INTEGRATION_GUIDE.md
  GUIDE_SUMMARY.md
  PLAYWRIGHT_AUTOMATION_COMPLETE_GUIDE.md
  PLAYWRIGHT_AUTOMATION_COMPLETE_GUIDE.pdf
.github/workflows/playwright.yml   # CI: runs the suite on Node 18/20, publishes reports
```

Generated output (`test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`, `screenshots/`) is gitignored and recreated on each run.

## Configuration

- Base URL, browser projects, timeouts, and reporters are set in [playwright.config.ts](playwright.config.ts).
- Tests run against `https://automationexercise.com` by default; relative `page.goto()` calls resolve against the configured `baseURL`.
- Reporters: HTML, JSON (`test-results.json`), JUnit (`test-results.xml`), and Allure (`allure-results/`).

## License

MIT — see [LICENSE](LICENSE).
