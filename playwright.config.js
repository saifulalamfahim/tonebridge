import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser-tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:4174', headless: true },
  webServer: {
    command: 'npm exec vite -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174/browser-tests/index.html',
    reuseExistingServer: !process.env.CI,
  },
});
