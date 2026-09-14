import { defineConfig, devices } from '@playwright/test';
import { BASE_URLS } from './fixtures/base-urls';

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
        baseURL: BASE_URLS.toolshopApi,
      },
    },
    {
      name: 'openweather',
      testMatch: '**/api/weather.api.spec.ts',
      use: {
        browserName: 'chromium',
        baseURL: BASE_URLS.openWeather,
      },
    },
    {
      name: 'tvmaze',
      testMatch: '**/api/tvmaze.api.spec.ts',
      use: {
        browserName: 'chromium',
        baseURL: BASE_URLS.tvMaze,
      },
    },
    {
      name: 'chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URLS.toolshop,
      },
    },
    {
      name: 'integration',
      testMatch: '**/integration/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URLS.toolshop,
      },
    },
  ],
});
