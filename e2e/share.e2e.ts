// ABOUTME: End-to-end tests for sharing a budget: the "find 10 billion" challenge, a share link that holds the visitor's
// ABOUTME: choices, opening such a link, the preview page for social networks, and the preview image on every page.
import { expect, test, type Page } from '@playwright/test';
import { PAGES_DEV_URL } from './servers.ts';

function map(page: Page) {
	return page.getByRole('region', { name: 'Budget map' });
}

function challenge(page: Page) {
	return page.getByRole('region', { name: /^Challenge: find/ });
}

async function cutDefence(page: Page, times: number) {
	await map(page)
		.getByRole('button', { name: /^Federal government/ })
		.click();
	const cut = map(page).getByRole('button', { name: 'Cut Defence by 1%' });
	for (let i = 0; i < times; i++) await cut.click();
}

test.describe('the 10 billion challenge', () => {
	test('shows how much of the 10 billion the visitor has found', async ({ page }) => {
		await page.goto('/en/');
		await expect(challenge(page)).toContainText('Challenge: find €10 billion');
		await expect(challenge(page)).toContainText('Make a choice on the map first.');
		await cutDefence(page, 3);
		await expect(challenge(page)).toContainText(/Found: €\d+ million of €10 billion/);
	});

	test('says when the choices make the deficit bigger', async ({ page }) => {
		await page.goto('/en/');
		await map(page)
			.getByRole('button', { name: /^Federal government/ })
			.click();
		await map(page).getByRole('button', { name: 'Add 1% to Defence' }).click();
		await expect(challenge(page)).toContainText(
			/Your choices make the deficit €\d+ million bigger/
		);
	});
});

test.describe('sharing a budget', () => {
	test('copies a link that holds the choices', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/en/');
		// Without the Web Share API (desktop Chromium), the link is copied.
		await page.evaluate(() => Object.defineProperty(navigator, 'share', { value: undefined }));
		await cutDefence(page, 2);
		await challenge(page).getByRole('button', { name: 'Share your budget' }).click();
		await expect(challenge(page)).toContainText('Link copied');
		const copied = await page.evaluate(() => navigator.clipboard.readText());
		expect(copied).toMatch(/^My Belgian budget finds €\d+ million\. Can you do better\? /);
		expect(copied).toMatch(/\/share\/en\/\?b=federal\.defence%3A-2&v=\d+$/);
	});

	test('keeps the choices in the address, so a copied address works too', async ({ page }) => {
		await page.goto('/en/');
		await cutDefence(page, 2);
		await expect(page).toHaveURL(/\?b=federal\.defence%3A-2$/);
	});

	test('opens a shared budget, without the intro, and can start again', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/en/?b=federal.defence:-10');
		await expect(page.getByRole('dialog', { name: 'Introduction' })).toBeHidden();
		await expect(challenge(page)).toContainText('You are looking at a shared budget.');
		await map(page)
			.getByRole('button', { name: /^Federal government/ })
			.click();
		await expect(map(page).getByRole('group', { name: /^Defence/ })).toContainText('−10%');
		await challenge(page).getByRole('button', { name: 'Start again' }).click();
		await expect(map(page).getByRole('group', { name: /^Defence/ })).not.toContainText('−10%');
		await expect(page).toHaveURL(/\/en\/$/);
	});
});

test.describe('previews on social networks', () => {
	test('every page has a title, description and preview image', async ({ page, request }) => {
		for (const lang of ['nl', 'fr', 'en']) {
			await page.goto(`/${lang}/`);
			const image = await page.locator('meta[property="og:image"]').getAttribute('content');
			expect(image).toMatch(new RegExp(`/og/${lang}\\.png$`));
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
				'content',
				/.+/
			);
			const response = await request.get(`/og/${lang}.png`);
			expect(response.ok()).toBe(true);
			expect(response.headers()['content-type']).toBe('image/png');
		}
	});

	test('the preview card shows the title, the challenge and the map', async ({ page }) => {
		await page.goto('/card/en/');
		const card = page.getByTestId('og-card');
		await expect(card).toContainText("Where does Belgium's money go?");
		await expect(card).toContainText('Challenge: find €10 billion');
		await expect(card.locator('rect').first()).toBeVisible();
	});

	test('the share page names the result, then opens the budget', async ({ page, request }) => {
		const response = await request.get(`${PAGES_DEV_URL}/share/en/?b=federal.defence%3A-10&v=2400`);
		expect(response.ok()).toBe(true);
		expect(await response.text()).toContain(
			'<meta property="og:title" content="My Belgian budget finds €2.4 billion. Can you do better?">'
		);
		await page.goto(`${PAGES_DEV_URL}/share/en/?b=federal.defence%3A-10&v=2400`);
		await expect(page).toHaveURL(/\/en\/\?b=federal\.defence(%3A|:)-10$/);
		await expect(challenge(page)).toContainText('You are looking at a shared budget.');
	});
});
