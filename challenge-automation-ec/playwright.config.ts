import { defineConfig } from '@playwright/test';

const reportEnvironment = process.env.TEST_ENV?.trim().toLowerCase() || 'qa';
if (!/^[a-z0-9-]+$/.test(reportEnvironment)) throw new Error(`Invalid TEST_ENV: ${reportEnvironment}`);
const parallel = true;

export default defineConfig({
  outputDir: `test-results/${reportEnvironment}/artifacts`,
  fullyParallel: parallel,
  workers: parallel ? 4 : 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: `playwright-report/${reportEnvironment}`, open: 'never' }],
  ],
  projects: [
    {
      name: 'api',
      testDir: './api/tests',
    },
    {
      name: 'web-chromium',
      testDir: './web/tests',
      timeout: 60_000,
      use: {
        headless: false,
        locale: 'en-US',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
  ],
});
