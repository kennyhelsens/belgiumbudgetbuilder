// ABOUTME: End-to-end tests for the budget map on a phone: rows under each other with full names, amounts, bars to
// ABOUTME: scale and −/+ buttons always in view, instead of a treemap too narrow to read. Runs against the production build.
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

function map(page: Page) {
	return page.getByRole('region', { name: 'Budget map' });
}

test.describe('budget map on a phone', () => {
	test('lists the governments as rows, largest first, each with its full name', async ({
		page
	}) => {
		await page.goto('/en/');
		const rows = map(page).getByTestId('bar-row');
		await expect(rows.first()).toContainText('Social security');
		expect(await rows.count()).toBeGreaterThanOrEqual(6);
		for (const name of await rows.locator('.bar__name').all()) {
			const clipped = await name.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
			expect(clipped).toBe(false);
		}
	});

	test('draws each bar to scale against the largest one', async ({ page }) => {
		await page.goto('/en/');
		const fills = map(page).getByTestId('bar-row').locator('.bar__fill');
		await expect(fills.first()).toBeVisible();
		const widths = await fills.evaluateAll((els) =>
			els.map((el) => parseFloat((el as HTMLElement).style.width))
		);
		expect(widths[0]).toBe(100);
		for (let i = 1; i < widths.length; i++) expect(widths[i]).toBeLessThanOrEqual(widths[i - 1]);
	});

	test('opens a government and changes a line with buttons that are always in view', async ({
		page
	}) => {
		await page.goto('/en/');
		await map(page)
			.getByRole('button', { name: /^Federal government/ })
			.click();
		const defence = map(page).getByRole('group', { name: /^Defence/ });
		await expect(defence).toContainText('Defence');
		const cut = map(page).getByRole('button', { name: 'Cut Defence by 1%' });
		await expect(cut).toBeVisible();
		await cut.click();
		await expect(defence).toContainText('−1%');
	});

	test('gives every bar in a government the same length, with or without buttons', async ({
		page
	}) => {
		await page.goto('/en/');
		await map(page)
			.getByRole('button', { name: /^Federal government/ })
			.click();
		const tracks = map(page).getByTestId('bar-row').locator('.bar__track');
		await expect(tracks.first()).toBeVisible();
		const widths = await tracks.evaluateAll((els) =>
			els.map((el) => Math.round(el.getBoundingClientRect().width))
		);
		expect(new Set(widths).size).toBe(1);
	});

	test('does not scroll sideways', async ({ page }) => {
		await page.goto('/en/');
		await map(page)
			.getByRole('button', { name: /^Federal government/ })
			.click();
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow).toBe(0);
	});
});
