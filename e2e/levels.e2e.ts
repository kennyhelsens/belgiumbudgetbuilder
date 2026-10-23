// ABOUTME: End-to-end tests for who collects each type of revenue: federal government, communities and regions, local
// ABOUTME: government or social security, shown on the tiles, the phone rows and the revenue card.
import { expect, test, type Page } from '@playwright/test';

function map(page: Page) {
	return page.getByRole('region', { name: 'Budget map' });
}

async function showRevenue(page: Page) {
	await page.goto('/en/');
	await map(page).getByRole('button', { name: 'Revenue' }).click();
}

test.describe('who collects the revenue', () => {
	test('shows on each tile who collects it, with a legend', async ({ page }) => {
		await showRevenue(page);
		const legend = map(page).getByRole('list', { name: 'Who collects it' });
		await expect(legend.getByRole('listitem')).toHaveCount(4);
		await expect(legend).toContainText('Communities and regions');
		const capital = map(page).getByRole('group', { name: /^Inheritance and gift taxes/ });
		const strip = capital.getByTestId('level-strip');
		await expect(strip.locator('[data-level]')).toHaveCount(2);
		const widths = await strip
			.locator('[data-level]')
			.evaluateAll((els) =>
				Object.fromEntries(
					els.map((el) => [
						el.getAttribute('data-level'),
						parseFloat((el as HTMLElement).style.width)
					])
				)
			);
		expect(widths['communities-and-regions']).toBeGreaterThan(80);
	});

	test('lists the amounts per level on the card, before transfers between governments', async ({
		page
	}) => {
		await showRevenue(page);
		const vat = map(page).getByRole('group', { name: /^VAT, excise duties/ });
		await vat.hover();
		await map(page)
			.getByRole('button', { name: /^Raise VAT, excise duties/ })
			.click();
		const card = page.getByRole('region', { name: /^More revenue from VAT, excise duties/ });
		const levels = card.getByRole('list', { name: 'Who collects it' });
		await expect(levels.getByRole('listitem').first()).toContainText('Federal government');
		await expect(levels.getByRole('listitem').first()).toContainText('€57.2 billion');
		await expect(card).toContainText('before money passes between governments');
	});

	test('explains why property income adds up to more than its total', async ({ page }) => {
		await showRevenue(page);
		await map(page)
			.getByRole('group', { name: /^Property income/ })
			.hover();
		await map(page)
			.getByRole('button', { name: /^Lower Property income/ })
			.click();
		const card = page.getByRole('region', { name: /^Less revenue from Property income/ });
		await expect(card).toContainText('The Planning Bureau does not explain the difference.');
	});

	test('shows who collects it on a phone too', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await showRevenue(page);
		const row = map(page).getByTestId('bar-row').filter({ hasText: 'Corporate income tax' });
		await expect(row.getByTestId('level-strip').locator('[data-level]')).toHaveCount(2);
	});
});
