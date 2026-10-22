// ABOUTME: Playwright configuration for end-to-end tests against the static production build.
// ABOUTME: PLAYWRIGHT_CHROMIUM_PATH optionally points to a preinstalled Chromium binary.
import { defineConfig } from '@playwright/test';
import { E2E_PERSIST, PAGES_DEV_PORT, PREVIEW_PORT } from './e2e/servers.ts';

export default defineConfig({
	webServer: [
		{ command: 'npm run build && npm run preview', port: PREVIEW_PORT },
		// The same build with the Pages Functions and a local D1 database, for the tracking tests.
		{
			command: `wrangler pages dev build --port ${PAGES_DEV_PORT} --d1 DB=bbb-local --persist-to ${E2E_PERSIST} --compatibility-date 2026-10-01`,
			port: PAGES_DEV_PORT,
			env: { WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false' }
		}
	],
	globalSetup: './e2e/global-setup.ts',
	testDir: 'e2e',
	testMatch: '**/*.e2e.{ts,js}',
	use: {
		baseURL: `http://localhost:${PREVIEW_PORT}`,
		// Visitors who have seen the intro land straight on the page; e2e/intro.e2e.ts starts without it.
		storageState: 'e2e/intro-seen.json',
		launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined }
	}
});
