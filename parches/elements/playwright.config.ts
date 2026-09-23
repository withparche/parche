import { defineConfig, devices } from '@playwright/test';

// Browser a11y tests run against the built playground. Three engines, because
// anchor positioning, `closedby` and the carousel pseudo-elements differ.
// Projects also run a no-JS pass (javaScriptEnabled: false) and a
// reduced-motion pass, so each element's degraded form is asserted too.
export default defineConfig({
  testDir: './test/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4390',
    trace: 'on-first-retry',
  },
  // A plain static server over the built playground. `astro preview` is a
  // daemon in Astro 7 and exits early when relaunched; a static server is
  // deterministic and is all a static build needs.
  webServer: {
    command: 'node test/browser/_serve.mjs 4390',
    url: 'http://localhost:4390',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // No script at all: the degraded markup must work on its own. Reduced
    // motion too, because with script disabled Chromium stops producing
    // animation frames once a CSS transition ends, and Playwright's stability
    // check (two equal frames) then never resolves for the next click.
    { name: 'no-js', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false, reducedMotion: 'reduce' } },
    { name: 'reduced-motion', use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' } },
  ],
});
