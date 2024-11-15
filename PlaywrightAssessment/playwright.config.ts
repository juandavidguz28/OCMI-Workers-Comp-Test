// playwright.config.ts
import { type PlaywrightTestConfig, devices } from '@playwright/test';
 
const config: PlaywrightTestConfig = {
  testMatch: "*.spec.ts",
  reporter: [["line"], ["junit", { outputFile: "reports/result.xml" }], ["allure-playwright"]],
  timeout: 580000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    screenshot: "on",
    video: "off",
    trace: 'on-first-retry',
 
    contextOptions: {
      ignoreHTTPSErrors: true,
 
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1362, height: 630 }  
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'], viewport: {
 
          width: 1362,
 
          height: 630,
 
        }
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile_safari',
      use: { ...devices['iPhone 12'] },
    },
    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'e2e_tests',
      testDir: './src/e2e_tests',
      testMatch: /.*.spec.tsx/,
    },
  ],
};
export default config;