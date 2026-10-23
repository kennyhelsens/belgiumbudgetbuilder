// ABOUTME: End-to-end tests for the revenue view of the budget map: what all governments take in, by type, to scale,
// ABOUTME: with −/+ buttons that move the deficit and the debt, and what less or more revenue could mean, in words.
import { expect, test, type Page } from '@playwright/test';

function map(page: Page) {
	return page.getByRole('region', { name: 'Budget map' });
}

async function showRevenue(page: Page, path = '/en/') {
	await page.goto(path);
	await map(page).getByRole('button', { name: 'Revenue' }).click();
}

const euros = async (page: Page, testId: string) =>
	Number(
		((await page.getByTestId(testId).locator('.metric__value').textContent()) ?? '').replace(
			/[^0-9.]/g,
			''
		)
	);

test.describe('revenue on the budget map', () => {
	test('switches between spending and revenue', async ({ page }) => {
		await page.goto('/en/');
		const spending = map(page).getByRole('button', { name: 'Spending' });
		const revenue = map(page).getByRole('button', { name: 'Revenue' });
		await expect(spending).toHaveAttribute('aria-pressed', 'true');
		await revenue.click();
		await expect(revenue).toHaveAttribute('aria-pressed', 'true');
		await expect(map(page)).toContainText('What all Belgian governments together take in');
		await expect(map(page).getByRole('group', { name: /^Corporate income tax/ })).toBeVisible();
		await expect(
			map(page).getByRole('img', { name: /^Imputed social contributions/ })
		).toBeVisible();
		await expect(map(page).getByRole('navigation', { name: 'You are here' })).toContainText(
			'€328.1 billion'
		);
		await spending.click();
		await expect(map(page).getByRole('button', { name: /^Federal government/ })).toBeVisible();
	});

	test('more revenue lowers the deficit and says what it could mean', async ({ page }) => {
		await showRevenue(page);
		const before = await euros(page, 'metric-deficit');
		await map(page)
			.getByRole('group', { name: /^Corporate income tax/ })
			.hover();
		await map(page).getByRole('button', { name: 'Raise Corporate income tax by 1%' }).click();

		await expect.poll(() => euros(page, 'metric-deficit')).toBeLessThan(before);
		const notice = page.getByRole('status').filter({ hasText: 'Corporate income tax' });
		await expect(notice).toContainText(/^More revenue from Corporate income tax could mean: \D+$/);
		const card = page.getByRole('region', {
			name: 'More revenue from Corporate income tax could mean:'
		});
		await expect(card.getByRole('listitem').first()).toBeVisible();
		await expect(page.getByTestId('balance-change')).toHaveText(/^\+€/);
	});

	test('less revenue raises the deficit', async ({ page }) => {
		await showRevenue(page);
		const before = await euros(page, 'metric-deficit');
		await map(page)
			.getByRole('group', { name: /^Corporate income tax/ })
			.hover();
		await map(page).getByRole('button', { name: 'Lower Corporate income tax by 1%' }).click();
		await expect.poll(() => euros(page, 'metric-deficit')).toBeGreaterThan(before);
		await expect(
			page.getByRole('region', { name: 'Less revenue from Corporate income tax could mean:' })
		).toBeVisible();
	});

	test('keeps spending and revenue changes apart, and a reset clears both', async ({ page }) => {
		await page.goto('/en/');
		const before = await euros(page, 'metric-deficit');
		await map(page)
			.getByRole('button', { name: /^Federal government/ })
			.click();
		await map(page).getByRole('button', { name: 'Cut Defence by 1%' }).click();
		await map(page).getByRole('button', { name: 'Revenue' }).click();
		await map(page)
			.getByRole('group', { name: /^Corporate income tax/ })
			.hover();
		await map(page).getByRole('button', { name: 'Raise Corporate income tax by 1%' }).click();
		await map(page).getByRole('button', { name: 'Spending' }).click();
		await expect(map(page).getByRole('group', { name: /^Defence/ })).toContainText('−1%');

		await page.getByRole('button', { name: 'Reset to the official budget' }).click();
		await expect.poll(() => euros(page, 'metric-deficit')).toBe(before);
	});

	test('says why imputed contributions cannot be changed', async ({ page }) => {
		await showRevenue(page);
		await map(page).getByText('Show as a table').click();
		const row = map(page).getByRole('row', { name: /^Imputed social contributions/ });
		await expect(row).toContainText('A bookkeeping entry: does not change the deficit');
		await expect(row.getByRole('slider')).toHaveCount(0);
		await expect(
			map(page)
				.getByRole('row', { name: /^Corporate income tax/ })
				.getByRole('link')
		).toHaveAttribute('href', /plan\.be/);
	});

	test('speaks Dutch on the Dutch page', async ({ page }) => {
		await page.goto('/nl/');
		const kaart = page.getByRole('region', { name: 'Begrotingskaart' });
		await kaart.getByRole('button', { name: 'Inkomsten' }).click();
		await kaart.getByRole('group', { name: /^Vennootschapsbelasting/ }).hover();
		await kaart.getByRole('button', { name: 'Verhoog Vennootschapsbelasting met 1%' }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Vennootschapsbelasting' });
		await expect(notice).toContainText(
			/^Meer inkomsten uit Vennootschapsbelasting kan betekenen: \D+$/
		);
	});

	test('lists the revenue types as rows on a phone', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await showRevenue(page);
		const rows = map(page).getByTestId('bar-row');
		await expect(rows).toHaveCount(9);
		await expect(rows.first()).toContainText('Social contributions');
		await expect(
			map(page).getByRole('button', { name: 'Raise Corporate income tax by 1%' })
		).toBeVisible();
	});
});
