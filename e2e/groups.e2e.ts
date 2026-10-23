// ABOUTME: End-to-end tests for the groups on the map of Belgium: Entity I (federal government and social security) and
// ABOUTME: Entity II (communities, regions and local government), as the Planning Bureau reports them.
import { expect, test, type Page } from '@playwright/test';

function map(page: Page) {
	return page.getByRole('region', { name: 'Budget map' });
}

test.describe('groups of governments', () => {
	test('pairs the federal government with social security, and names both groups', async ({
		page
	}) => {
		await page.goto('/en/');
		await expect(map(page).getByTestId('group-box')).toHaveCount(2);
		await expect(map(page).getByRole('button', { name: /^Social security/ })).toContainText(
			'Entity I'
		);
		await expect(map(page).getByRole('button', { name: /^Flanders/ })).toContainText('Entity II');
		const groups = map(page).getByRole('list', { name: 'Groups of governments' });
		await expect(groups.getByRole('listitem')).toHaveCount(2);
		await expect(groups.getByRole('listitem').first()).toContainText(
			'Entity I: federal government and social security'
		);
		await expect(groups).toContainText('Entity II: communities, regions and local government');
	});

	test('draws each group around its own governments', async ({ page }) => {
		await page.goto('/en/');
		const box = await map(page).getByTestId('group-box').first().boundingBox();
		for (const name of [/^Social security/, /^Federal government/]) {
			const tile = await map(page).getByRole('button', { name }).boundingBox();
			expect(tile!.x).toBeGreaterThanOrEqual(box!.x - 1);
			expect(tile!.y).toBeGreaterThanOrEqual(box!.y - 1);
			expect(tile!.x + tile!.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
			expect(tile!.y + tile!.height).toBeLessThanOrEqual(box!.y + box!.height + 1);
		}
	});

	test('says how social security relates to the federal government', async ({ page }) => {
		await page.goto('/en/');
		await map(page)
			.getByRole('button', { name: /^Social security/ })
			.click();
		const note = map(page).getByTestId('entity-note');
		await expect(note).toContainText('Entity I');
		await expect(note).toContainText('grants from the federal government');
	});

	test('shows the groups as sections on a phone', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/en/');
		const first = map(page).getByRole('region', {
			name: /^Entity I: federal government and social security/
		});
		await expect(first.getByTestId('bar-row')).toHaveCount(2);
		await expect(first.getByTestId('bar-row').first()).toContainText('Social security');
		const second = map(page).getByRole('region', {
			name: /^Entity II: communities, regions and local government/
		});
		await expect(second.getByTestId('bar-row').first()).toContainText('Flanders');
	});

	test('speaks Dutch on the Dutch page', async ({ page }) => {
		await page.goto('/nl/');
		const kaart = page.getByRole('region', { name: 'Begrotingskaart' });
		await expect(kaart.getByRole('list', { name: 'Groepen van overheden' })).toContainText(
			'Entiteit I: federale overheid en sociale zekerheid'
		);
	});
});
