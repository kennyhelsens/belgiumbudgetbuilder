// ABOUTME: End-to-end tests for the budget map: zooming from Belgium into a government and back, and the table view.
// ABOUTME: Runs against the production build with the real data in data/2026.
import { expect, test } from '@playwright/test';

test.describe('budget map', () => {
	test('shows one tile per government for Belgium as a whole', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await expect(map.getByRole('button', { name: /^Federal government/ })).toBeVisible();
		await expect(map.getByRole('button', { name: /^Social security/ })).toBeVisible();
		await expect(map.getByRole('button', { name: /^Flanders/ })).toBeVisible();
	});

	test('zooms into a government and back to Belgium', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Social security/ }).click();

		const crumbs = map.getByRole('navigation', { name: 'You are here' });
		await expect(crumbs).toContainText('Belgium');
		await expect(crumbs).toContainText('Social security');
		await expect(map.getByRole('button', { name: /^Flanders/ })).toHaveCount(0);
		await expect(
			map.getByRole('img', { name: /Social security in the whole budget/ })
		).toBeVisible();

		await crumbs.getByRole('button', { name: 'Belgium' }).click();
		await expect(map.getByRole('button', { name: /^Flanders/ })).toBeVisible();
	});

	test('offers the same figures as a table, each with its source', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByText('Show as a table').click();
		const table = map.getByRole('table');
		await expect(table.getByRole('row', { name: /Federal government/ })).toBeVisible();

		await map.getByRole('button', { name: /^Federal government/ }).click();
		const sourceLinks = map.getByRole('table').getByRole('link');
		expect(await sourceLinks.count()).toBeGreaterThan(0);
		for (const href of await sourceLinks.evaluateAll((links) =>
			links.map((l) => l.getAttribute('href'))
		)) {
			expect(href).toMatch(/^https:\/\//);
		}
	});

	test('works in Dutch and French', async ({ page }) => {
		await page.goto('/nl/');
		await expect(
			page.getByRole('region', { name: 'Begrotingskaart' }).getByRole('button', {
				name: /^Federale overheid/
			})
		).toBeVisible();
		await page.goto('/fr/');
		await expect(
			page.getByRole('region', { name: 'Carte du budget' }).getByRole('button', {
				name: /^Pouvoir fédéral/
			})
		).toBeVisible();
	});
});
