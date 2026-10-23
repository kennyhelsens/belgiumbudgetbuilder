// ABOUTME: End-to-end tests for the honesty signals: the work-in-progress badge, the disclaimer on how the
// ABOUTME: figures were extracted, and the FAQ page it links to. Runs against the production build.
import { expect, test } from '@playwright/test';

test.describe('work in progress', () => {
	for (const [lang, badge] of [
		['nl', 'In opbouw'],
		['fr', 'En construction'],
		['en', 'Work in progress']
	]) {
		test(`${lang}: the masthead says the site is a work in progress`, async ({ page }) => {
			await page.goto(`/${lang}/`);
			await expect(page.getByRole('banner').getByText(badge, { exact: true })).toBeVisible();
		});
	}
});

test.describe('disclaimer', () => {
	test('says how the figures were extracted and links to the FAQ', async ({ page }) => {
		await page.goto('/en/');
		const footer = page.getByRole('contentinfo');
		await expect(footer).toContainText('BOSA');
		await expect(footer).toContainText('lachambre.be');
		await expect(footer).toContainText('AI agents');
		await expect(footer).toContainText('Mistakes are possible');
		await footer.getByRole('link', { name: /FAQ/ }).click();
		await expect(page).toHaveURL('/en/faq/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'FAQ: how the numbers are made'
		);
	});

	test('says who the site is for, and what it is not', async ({ page }) => {
		await page.goto('/en/');
		const footer = page.getByRole('contentinfo');
		await expect(footer).toContainText('not built for politicians');
		await expect(footer).toContainText('makes no claim to be 100% correct');
		await expect(footer).toContainText('not a budgeting tool for governments');
		await page.goto('/nl/');
		await expect(page.getByRole('contentinfo')).toContainText('niet gemaakt voor politici');
	});

	test('the FAQ shows its tables and sections', async ({ page }) => {
		await page.goto('/en/faq/');
		await expect(
			page.getByRole('heading', { name: 'Where do the figures come from?' })
		).toBeVisible();
		await expect(page.locator('main table').first()).toBeVisible();
	});

	test('the Dutch FAQ page says it is only in English', async ({ page }) => {
		await page.goto('/nl/');
		await page.getByRole('contentinfo').getByRole('link', { name: /FAQ/ }).click();
		await expect(page).toHaveURL('/nl/faq/');
		await expect(page.getByText('Deze pagina bestaat enkel in het Engels.')).toBeVisible();
		await expect(page.locator('main [lang="en"]')).toBeVisible();
	});
});
