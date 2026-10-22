// ABOUTME: End-to-end tests for the consequence card: one plain sentence about what a change means, where it lands
// ABOUTME: and how it could be done. Runs against the production build with the real data in data/2026.
import { expect, test } from '@playwright/test';

async function openHealthcare(page: import('@playwright/test').Page) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Social security/ }).click();
	await map.getByText('Show as a table').click();
	return map;
}

test.describe('consequence card', () => {
	test('appears when healthcare spending is changed, with where the cut lands', async ({
		page
	}) => {
		const map = await openHealthcare(page);
		await expect(page.getByRole('region', { name: /^What .* on Healthcare/ })).toHaveCount(0);

		await map.getByRole('slider', { name: /^Change Healthcare/ }).fill('-10');
		const card = page.getByRole('region', { name: /^What .* on Healthcare/ });
		await expect(card).toBeVisible();
		await expect(card).toContainText('Where it would land');
		await expect(card.getByTestId('amounts')).toContainText('less per inhabitant');
		await expect(
			card.getByRole('list', { name: 'Where it would land' }).getByRole('listitem')
		).not.toHaveCount(0);
	});

	test('lists the official levers, each with a neutral explanation and a source', async ({
		page
	}) => {
		const map = await openHealthcare(page);
		await map.getByRole('slider', { name: /^Change Healthcare/ }).fill('-10');
		const card = page.getByRole('region', { name: /^What .* on Healthcare/ });
		await expect(card).toContainText('How could it be done?');
		const levers = card.getByRole('group', { name: 'How could it be done?' }).locator('details');
		expect(await levers.count()).toBeGreaterThan(2);
		await levers.first().locator('summary').click();
		await expect(levers.first().getByRole('link')).toHaveAttribute('href', /^https:\/\//);
	});

	test('disappears again when the change is undone', async ({ page }) => {
		const map = await openHealthcare(page);
		const slider = map.getByRole('slider', { name: /^Change Healthcare/ });
		await slider.fill('-10');
		await expect(page.getByRole('region', { name: /^What .* on Healthcare/ })).toBeVisible();
		await slider.fill('0');
		await expect(page.getByRole('region', { name: /^What .* on Healthcare/ })).toHaveCount(0);
	});
});

test.describe('consequence card for a line with only examples', () => {
	test('shows the examples, without the sections it has no data for', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByRole('button', { name: 'Cut Defence by 1%' }).click();
		const card = page.getByRole('region', { name: 'What −1% on Defence means' });
		await expect(card).toContainText("That's as much as about");
		await expect(card).toContainText('average yearly pay costs of a member of the armed forces');
		await expect(card).not.toContainText('Where it would land');
		await expect(card).not.toContainText('How could it be done?');
	});
});

test.describe('consequence card for a benefit line', () => {
	test('tells the change as time for the people who receive it, in plain words', async ({
		page
	}) => {
		await page.goto('/nl/');
		const map = page.getByRole('region', { name: 'Begrotingskaart' });
		await map.getByRole('button', { name: /^Sociale zekerheid/ }).click();
		await map.getByText('Toon als tabel').click();
		await map.getByRole('slider', { name: 'Wijzig Pensioenen werknemers, in procent' }).fill('-6');

		const card = page.getByRole('region', { name: 'Wat −6% op Pensioenen werknemers betekent' });
		await expect(card).toContainText(
			"Alsof elke gepensioneerde werknemer zo'n 3 weken pensioen per jaar minder krijgt."
		);
		// One example, a year against a year, rounded: an illustration, not an exact count.
		await expect(card).toContainText(
			'Of ongeveer 150.000 × jaren gemiddeld brutopensioen uit de werknemersregeling'
		);
		await expect(card).not.toContainText('minimumpensioenen');
		await expect(card.getByTestId('amounts')).toHaveText(
			/^−€\s2,6\smiljard per jaar · €\s218 minder per inwoner$/
		);
	});
});
