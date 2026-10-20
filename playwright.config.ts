// ABOUTME: Playwright configuration for end-to-end tests against the static production build.
// ABOUTME: PLAYWRIGHT_CHROMIUM_PATH optionally points to a preinstalled Chromium binary.
import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testDir: 'e2e',
	testMatch: '**/*.e2e.{ts,js}',
	use: {
		baseURL: 'http://localhost:4173',
		launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined }
	}
});
