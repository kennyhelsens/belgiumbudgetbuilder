// ABOUTME: End-to-end tests for the frame around the federal government and social security on the map of Belgium:
// ABOUTME: two separate budgets, both under federal policy, in one colour with a caption that says so.
import { expect, test, type Page } from '@playwright/test';

function map(page: Page) {
	return page.getByRole('region', { name: 'Budget map' });
}

test.describe('federal government and social security', () => {
	test('share one colour and one frame, with a caption that explains why', async ({ page }) => {
		await page.goto('/en/');
		await expect(map(page).getByTestId('group-box')).toHaveCount(1);
		await expect(map(page).getByTestId('group-caption')).toHaveText(
			'Federal government and social security: two separate budgets, both under federal policy'
		);
		const federal = map(page).getByRole('button', { name: /^Federal government/ });
		const socialSecurity = map(page).getByRole('button', { name: /^Social security/ });
		await expect(federal).toHaveAttribute('style', /--tile-color:\s*var\(--series-1\)/);
		await expect(socialSecurity).toHaveAttribute('style', /--tile-color:\s*var\(--series-1\)/);
		await expect(map(page).getByRole('button', { name: /^Flanders/ })).not.toHaveAttribute(
			'style',
			/--tile-color:\s*var\(--series-1\)/
		);
		await expect(map(page)).not.toContainText('Entity');
	});

	test('draws the frame around both of them', async ({ page }) => {
		await page.goto('/en/');
		const box = await map(page).getByTestId('group-box').boundingBox();
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
		await expect(note).toContainText('own budget');
		await expect(note).toContainText('grants from the federal government');
	});

	test('shows them as one section on a phone, the others below', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/en/');
		const section = map(page).getByRole('region', {
			name: /^Federal government and social security: two separate budgets/
		});
		await expect(section.getByTestId('bar-row')).toHaveCount(2);
		await expect(section.getByTestId('bar-row').first()).toContainText('Social security');
		await expect(map(page).getByTestId('bar-row')).toHaveCount(7);
	});

	test('speaks Dutch on the Dutch page', async ({ page }) => {
		await page.goto('/nl/');
		const kaart = page.getByRole('region', { name: 'Begrotingskaart' });
		await expect(kaart.getByTestId('group-caption')).toHaveText(
			'Federale overheid en sociale zekerheid: twee aparte begrotingen, allebei federaal beleid'
		);
	});
});
