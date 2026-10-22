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

test.describe('national-accounts reference total', () => {
	test('shows BOSA’s national-accounts total beside a government, with its source', async ({
		page
	}) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Social security/ }).click();
		const reference = map.getByTestId('national-accounts');
		await expect(reference).toContainText('In the national accounts (ESA, initial budget)');
		await expect(reference).toContainText('€147.3 billion');
		await expect(reference.getByRole('link')).toHaveAttribute('href', /56K1278001\.pdf$/);
	});

	test('shows no reference total where none is published', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Flanders/ }).click();
		await expect(map.getByTestId('national-accounts')).toHaveCount(0);
	});
});

test.describe('tile tooltips', () => {
	async function openFederal(page: import('@playwright/test').Page) {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		return map;
	}

	test('a small tile shows its name and amount on hover', async ({ page }) => {
		const map = await openFederal(page);
		await map.getByRole('group', { name: /^Immigration Office/ }).hover();
		const tooltip = map.getByRole('tooltip');
		await expect(tooltip).toBeVisible();
		await expect(tooltip).toContainText('Immigration Office');
		await expect(tooltip).toContainText('€218 million');
	});

	test('keyboard focus on a small tile shows its tooltip too', async ({ page }) => {
		const map = await openFederal(page);
		await page.mouse.move(0, 0);
		await map.getByRole('button', { name: 'Cut Immigration Office by 1%' }).focus();
		await expect(map.getByRole('tooltip')).toContainText('Immigration Office');
	});

	test('a tile whose text fits shows no tooltip', async ({ page }) => {
		const map = await openFederal(page);
		await map.getByRole('group', { name: /^Defence/ }).hover();
		await expect(map.getByRole('tooltip')).toHaveCount(0);
	});
});

test.describe('going back up a level', () => {
	test('a back button returns from a government to Belgium as a whole', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await expect(map.getByRole('button', { name: /^Back to Belgium/ })).toHaveCount(0);
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByRole('button', { name: /^Back to Belgium/ }).click();
		await expect(map.getByRole('button', { name: /^Federal government/ })).toBeVisible();
		await expect(map.getByRole('button', { name: /^Back to Belgium/ })).toHaveCount(0);
	});
});
