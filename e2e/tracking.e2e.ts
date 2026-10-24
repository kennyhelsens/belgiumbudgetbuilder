// ABOUTME: End-to-end tests for anonymous click tracking: the real site and API on `wrangler pages dev` with a local
// ABOUTME: D1 database. Checks what is stored after a visit, and that visitors who opt out send nothing.
import { expect, test, type Page } from '@playwright/test';
import { getPlatformProxy } from 'wrangler';
import type { Db } from '../src/lib/tracking/store.ts';
import { E2E_PROXY_PERSIST, PAGES_DEV_URL } from './servers.ts';

test.use({
	baseURL: PAGES_DEV_URL,
	storageState: {
		cookies: [],
		origins: [{ origin: PAGES_DEV_URL, localStorage: [{ name: 'bbb-intro-seen', value: '1' }] }]
	}
});

async function query<T>(sql: string): Promise<T[]> {
	const { env, dispose } = await getPlatformProxy<{ DB: Db }>({
		configPath: 'wrangler.local.toml',
		persist: { path: E2E_PROXY_PERSIST }
	});
	try {
		return (await env.DB.prepare(sql).all()).results as T[];
	} finally {
		await dispose();
	}
}

const countRows = async () =>
	(await query<{ n: number }>('SELECT count(*) AS n FROM tile_clicks'))[0].n;

async function visitAndClick(page: Page) {
	// The map is in the prerendered HTML before its scripts run; on the slower `wrangler pages dev`, a click before
	// the page is hydrated does nothing. Wait until the scripts have loaded.
	await page.goto('/en/', { waitUntil: 'networkidle' });
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Federal government/ }).click();
	const cut = map.getByRole('button', { name: 'Cut Defence by 1%' });
	await cut.click();
	await cut.click();
	await map.getByRole('group', { name: /^Justice/ }).hover();
	await map.getByRole('button', { name: 'Add 1% to Justice' }).click();
	// Leaving the page sends what is still queued.
	await page.goto('about:blank');
}

test.describe('click tracking', () => {
	test('stores which tiles a visitor opens, cuts and adds to, and nothing else', async ({
		page
	}) => {
		const before = await countRows();
		await visitAndClick(page);
		await expect.poll(countRows, { timeout: 15_000 }).toBe(before + 4);
		const [{ session }] = await query<{ session: string }>(
			'SELECT session FROM tile_clicks ORDER BY id DESC LIMIT 1'
		);
		expect(session).toMatch(/^[0-9a-f-]{36}$/);
		const rows = await query<Record<string, unknown>>(
			`SELECT seq, locale, line, action, percent FROM tile_clicks WHERE session = '${session}' ORDER BY seq`
		);
		expect(rows).toEqual([
			{ seq: 0, locale: 'en', line: 'federal', action: 'open', percent: 0 },
			{ seq: 1, locale: 'en', line: 'federal.defence', action: 'cut', percent: -1 },
			{ seq: 2, locale: 'en', line: 'federal.defence', action: 'cut', percent: -2 },
			{ seq: 3, locale: 'en', line: 'federal.justice', action: 'add', percent: 1 }
		]);
	});

	test('sends nothing when the browser asks not to be tracked', async ({ page }) => {
		await page.addInitScript(() =>
			Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true })
		);
		const requests: string[] = [];
		page.on('request', (request) => {
			if (request.url().includes('/api/events')) requests.push(request.url());
		});
		await visitAndClick(page);
		expect(requests).toEqual([]);
	});
});
