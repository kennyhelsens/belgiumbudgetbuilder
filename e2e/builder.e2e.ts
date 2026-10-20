// ABOUTME: End-to-end tests for building your own budget: line sliders feed the ten-year debt outlook.
// ABOUTME: Runs against the production build with the real data in data/2026.
import { expect, test, type Page } from '@playwright/test';

async function debtAtHorizon(page: Page) {
	const text = await page.getByTestId('debt-at-horizon').textContent();
	return Number((text ?? '').replace(/[^0-9.]/g, ''));
}

test.describe('ten-year outlook', () => {
	test('shows the debt ratio at the end of the horizon', async ({ page }) => {
		await page.goto('/en/');
		const outlook = page.getByRole('region', { name: 'Ten-year outlook' });
		await expect(outlook).toContainText('Debt in 2036');
		await expect(page.getByTestId('debt-at-horizon')).toContainText('% of GDP');
	});

	test('extends to twenty years on request', async ({ page }) => {
		await page.goto('/en/');
		const outlook = page.getByRole('region', { name: 'Ten-year outlook' });
		await outlook.getByRole('radio', { name: '20 years' }).check();
		await expect(outlook).toContainText('Debt in 2046');
	});

	test('explains what the model leaves out', async ({ page }) => {
		await page.goto('/en/');
		await expect(page.getByRole('region', { name: 'Ten-year outlook' })).toContainText(
			'does not model how people and companies react'
		);
	});
});

test.describe('building your own budget', () => {
	test('cutting a spending line lowers the projected debt', async ({ page }) => {
		await page.goto('/en/');
		const before = await debtAtHorizon(page);

		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByText('Show as a table').click();
		const slider = map.getByRole('slider').first();
		await slider.fill('-20');

		await expect(page.getByTestId('balance-change')).not.toHaveText(/^\+?€0/);
		await expect.poll(() => debtAtHorizon(page)).toBeLessThan(before);
	});

	test('a reset puts every line back to the official budget', async ({ page }) => {
		await page.goto('/en/');
		const before = await debtAtHorizon(page);
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByText('Show as a table').click();
		await map.getByRole('slider').first().fill('20');
		await page.getByRole('button', { name: 'Reset to the official budget' }).click();
		await expect.poll(() => debtAtHorizon(page)).toBe(before);
	});
});
