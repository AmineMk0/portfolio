import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', timeout: 30_000, fullyParallel: false,
  globalTimeout: 120_000,
  use: { baseURL: 'http://portfolio.test', headless: true, channel: 'chrome', launchOptions: { timeout: 15_000, args: ['--no-sandbox'] } },
});
