import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Config for the INTENTIONAL failure demo (tests/FailureDemo.spec.ts).
 *
 *   npm run test:failures          -> run the failing scenarios
 *   npm run test:failures:report   -> open their HTML report
 *
 * Uses its own report/output folders so it never overwrites the main suite's report.
 */
export default defineConfig({
  ...baseConfig,
  testIgnore: [],
  testMatch: 'FailureDemo.spec.ts',
  // No retries: show each failure immediately instead of retrying it
  retries: 0,
  outputDir: 'test-results-failures',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-failures', open: 'never' }]
  ],
  use: {
    ...baseConfig.use,
    // Keep full evidence for every failure: screenshot, video and a trace
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
