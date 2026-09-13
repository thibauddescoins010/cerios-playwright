import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    headless: Boolean(process.env.CI),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/api/catalog.api.spec.ts',
      use: {
        browserName: 'chromium',
        baseURL: 'https://api.practicesoftwaretesting.com',
      },
    },
    {
      name: 'openweather',
      testMatch: '**/api/weather.api.spec.ts',
      use: {
        browserName: 'chromium',
        baseURL: 'https://api.openweathermap.org',
      },
    },
    {
      name: 'tvmaze',
      testMatch: '**/api/tvmaze.api.spec.ts',
      use: {
        browserName: 'chromium',
        baseURL: 'https://api.tvmaze.com',
      },
    },
    {
      name: 'chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://practicesoftwaretesting.com',
      },
    },
  ],
});
