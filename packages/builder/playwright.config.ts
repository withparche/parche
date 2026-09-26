import { defineConfig, devices } from '@playwright/test';

// The editor's golden paths against the fixture site (playground/), seeded
// fresh and served by `parche astro builder` itself, as a person would run it.
export default defineConfig({
  testDir: 'test/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4610', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: 'node playground/scripts/seed.mjs && pnpm --filter @parche/cli dev astro builder --root ../builder/playground --port 4610',
    url: 'http://localhost:4610/_parche/builder',
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
  },
});
