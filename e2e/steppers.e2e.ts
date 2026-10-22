// ABOUTME: End-to-end tests for the −/+ buttons on budget map tiles: 1% steps, the marked slice, and
// ABOUTME: that the table, the outlook and small tiles follow. Runs against the production build with real data.
import { expect, test, type Page } from '@playwright/test';

async function openFederal(page: Page) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Federal government/ }).click();
	return map;
}

test.describe('tile steppers', () => {
	test('cut a line one percent at a time, straight from its tile', async ({ page }) => {
		const map = await openFederal(page);
		const cut = map.getByRole('button', { name: 'Cut Defence by 1%' });
		await cut.click();
		await cut.click();
		await cut.click();

		const tile = map.getByRole('group', { name: /^Defence/ });
		await expect(tile).toContainText('−3%');
		const slice = tile.getByTestId('change-slice');
		await expect(slice).toHaveAttribute('data-kind', 'cut');
		await expect(slice).toHaveAttribute('style', /width:\s*3%/);
		await expect(page.getByTestId('balance-change')).not.toHaveText(/^\+?€0/);

		await map.getByText('Show as a table').click();
		await expect(map.getByRole('slider', { name: 'Change Defence, in percent' })).toHaveValue('-3');
	});

	test('an addition is marked differently from a cut', async ({ page }) => {
		const map = await openFederal(page);
		const tile = map.getByRole('group', { name: /^Justice/ });
		const add = map.getByRole('button', { name: 'Add 1% to Justice' });
		await tile.hover();
		await add.click();
		await add.click();

		await expect(tile).toContainText('+2%');
		await expect(tile.getByTestId('change-slice')).toHaveAttribute('data-kind', 'add');
	});

	test('small tiles show their buttons when they get focus', async ({ page }) => {
		const map = await openFederal(page);
		const cut = map.getByRole('button', { name: 'Cut Immigration Office by 1%' });
		const stepper = cut.locator('..');
		await page.mouse.move(0, 0);
		await expect(stepper).toHaveCSS('opacity', '0');
		await cut.focus();
		await expect(stepper).toHaveCSS('opacity', '1');
		await page.keyboard.press('Enter');
		await expect(map.getByRole('group', { name: /^Immigration Office/ })).toContainText('−1%');
	});

	test('display-only governments have no buttons', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Local government/ }).click();
		await expect(map.getByRole('button', { name: /^Cut / })).toHaveCount(0);
	});
});

test.describe('fixed lines', () => {
	test('interest on the public debt cannot be changed, and says why', async ({ page }) => {
		const map = await openFederal(page);
		await expect(
			map.getByRole('button', { name: /Interest on the public debt by 1%/ })
		).toHaveCount(0);
		await expect(map.getByRole('img', { name: /^Interest on the public debt/ })).toContainText(
			'Follows from the debt and interest rates'
		);
		await map.getByText('Show as a table').click();
		const row = map.getByRole('row', { name: /^Interest on the public debt/ });
		await expect(row.getByRole('slider')).toHaveCount(0);
		await expect(row).toContainText('Follows from the debt and interest rates');
	});
});
