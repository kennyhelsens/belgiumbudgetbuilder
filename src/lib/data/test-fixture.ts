// ABOUTME: Builds a small, internally consistent dataset for unit tests of the data layer.
// ABOUTME: Test-only input data; the published site reads the real files in data/.
import type { Dataset } from './schema.ts';

export function datasetFixture(): Dataset {
	const ref = (locator: string) => ({ source: 'fed-budget', locator });
	return {
		year: 2026,
		sources: [
			{
				id: 'fed-budget',
				title: 'Federal budget 2026, first adjustment',
				publisher: 'Chamber of Representatives',
				url: 'https://www.dekamer.be/example.pdf',
				published: '2026-05-19',
				retrieved: '2026-10-20'
			},
			{
				id: 'socsec-budget',
				title: 'Social security global management 2026',
				publisher: 'RSZ',
				url: 'https://www.socialsecurity.be/example.pdf',
				published: '2026-05',
				retrieved: '2026-10-20'
			}
		],
		overview: {
			gdp: { eurMillion: 600000, ref: ref('p. 1') },
			expenditure: { eurMillion: 330000, ref: ref('p. 2') },
			revenue: { eurMillion: 300000, ref: ref('p. 2') },
			balance: { eurMillion: -30000, ref: ref('p. 2') },
			interest: { eurMillion: 14000, ref: ref('p. 3') },
			debt: { eurMillion: 640000, ref: ref('p. 3') }
		},
		entities: [
			{
				id: 'federal',
				label: { nl: 'Federale overheid', fr: 'Pouvoir fédéral', en: 'Federal government' },
				government: 'federal',
				adjustable: true,
				budgetStatus: 'adjusted',
				expenditure: {
					total: { eurMillion: 100, ref: ref('p. 10') },
					lines: [
						{
							id: 'federal.justice',
							label: { nl: 'Justitie', fr: 'Justice', en: 'Justice' },
							amount: { eurMillion: 40, ref: ref('p. 11') },
							nature: 'discretionary'
						},
						{
							id: 'federal.socsec-subsidy',
							label: {
								nl: 'Dotatie sociale zekerheid',
								fr: 'Dotation sécurité sociale',
								en: 'Grant to social security'
							},
							amount: { eurMillion: 60, ref: ref('p. 12') },
							nature: 'committed',
							transferTo: 'social-security'
						}
					]
				}
			},
			{
				id: 'social-security',
				label: { nl: 'Sociale zekerheid', fr: 'Sécurité sociale', en: 'Social security' },
				government: 'social-security',
				adjustable: true,
				budgetStatus: 'adjusted',
				expenditure: {
					total: { eurMillion: 200, ref: { source: 'socsec-budget', locator: 'table 1' } },
					lines: [
						{
							id: 'social-security.pensions',
							label: { nl: 'Pensioenen', fr: 'Pensions', en: 'Pensions' },
							amount: { eurMillion: 200, ref: { source: 'socsec-budget', locator: 'table 1' } },
							nature: 'entitlement'
						}
					]
				}
			}
		]
	};
}
