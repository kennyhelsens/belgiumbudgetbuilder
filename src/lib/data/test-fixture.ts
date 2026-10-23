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
			debt: { eurMillion: 640000, ref: ref('p. 3') },
			population: { persons: 12000000, ref: ref('p. 4') }
		},
		history: {
			deficitWidening: {
				from: 2016,
				to: 2025,
				balance: { eurMillion: 18000, ref: ref('p. 6') },
				primaryBalance: { eurMillion: 21000, ref: ref('p. 6') },
				lowerRevenue: { eurMillion: 12000, ref: ref('p. 6') },
				higherPrimaryExpenditure: { eurMillion: 9000, ref: ref('p. 6') },
				federal: { eurMillion: 11000, ref: ref('p. 6') },
				communitiesAndRegions: { eurMillion: 8000, ref: ref('p. 6') }
			}
		},
		outlook: {
			interestRate: { value: 0.023, ref: ref('p. 4') },
			nominalGrowth: { value: 0.031, ref: ref('p. 4') },
			ageingCostPctGdp: [
				{ year: 2026, value: 25.7, ref: ref('p. 5') },
				{ year: 2036, value: 27.0, ref: ref('p. 5') }
			],
			ageingGroups: [
				{
					id: 'pensions',
					points: [
						{ year: 2026, value: 11.3, ref: ref('p. 5') },
						{ year: 2036, value: 12.0, ref: ref('p. 5') }
					]
				}
			],
			officialDebtPctGdp: [
				{ year: 2026, value: 109.9, ref: ref('p. 6') },
				{ year: 2031, value: 122.3, ref: ref('p. 6') }
			]
		},
		revenue: {
			types: [
				{
					id: 'revenue.income-tax',
					label: { nl: 'Personenbelasting', fr: 'Impôt des personnes physiques', en: 'Income tax' },
					amount: { eurMillion: 180000, ref: ref('p. 2') },
					byLevel: {
						amounts: [
							{ level: 'federal', amount: { eurMillion: 150000, ref: ref('p. 60') } },
							{ level: 'communities-and-regions', amount: { eurMillion: 30000, ref: ref('p. 61') } }
						]
					},
					effects: {
						cut: [
							{
								nl: 'minder belasting op loon',
								fr: 'moins d’impôt sur le salaire',
								en: 'less tax on wages'
							}
						],
						add: [
							{
								nl: 'meer belasting op loon',
								fr: 'plus d’impôt sur le salaire',
								en: 'more tax on wages'
							}
						],
						ref: ref('p. 7')
					}
				},
				{
					id: 'revenue.contributions',
					label: {
						nl: 'Sociale bijdragen',
						fr: 'Cotisations sociales',
						en: 'Social contributions'
					},
					amount: { eurMillion: 120000, ref: { source: 'socsec-budget', locator: 'table 2' } },
					adjustable: false,
					fixedNote: {
						nl: 'Volgt de lonen.',
						fr: 'Suit les salaires.',
						en: 'Follows wages.'
					}
				}
			]
		},
		groups: [
			{
				id: 'federal-level',
				label: {
					nl: 'Federale overheid en sociale zekerheid: twee aparte begrotingen, allebei federaal beleid',
					fr: 'Pouvoir fédéral et sécurité sociale : deux budgets distincts, relevant tous deux de la politique fédérale',
					en: 'Federal government and social security: two separate budgets, both under federal policy'
				},
				members: ['federal', 'social-security'],
				ref: ref('p. 28')
			}
		],
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
							nature: 'discretionary',
							theme: 'security'
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
							nature: 'entitlement',
							ageingGroup: 'pensions'
						}
					]
				}
			}
		],
		details: [
			{
				line: 'federal.justice',
				breakdown: [
					{
						id: 'courts',
						label: { nl: 'Rechtbanken', fr: 'Tribunaux', en: 'Courts' },
						amount: { eurMillion: 30, ref: ref('p. 20') }
					},
					{
						id: 'prisons',
						label: { nl: 'Gevangenissen', fr: 'Prisons', en: 'Prisons' },
						amount: { eurMillion: 10, ref: ref('p. 21') }
					}
				],
				equivalents: [
					{
						id: 'judge-year',
						label: {
							nl: 'jaarloon van een rechter',
							fr: "salaire annuel d'un juge",
							en: "a judge's yearly salary"
						},
						unitEur: { value: 100000, ref: ref('p. 22') }
					}
				],
				levers: [
					{
						id: 'court-fees',
						label: { nl: 'Griffierechten', fr: 'Droits de greffe', en: 'Court fees' },
						description: {
							nl: 'Wat partijen betalen om een zaak in te leiden.',
							fr: 'Ce que les parties paient pour introduire une affaire.',
							en: 'What parties pay to bring a case.'
						},
						ref: ref('p. 23')
					}
				]
			}
		]
	};
}
