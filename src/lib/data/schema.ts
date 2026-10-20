// ABOUTME: Schema for the budget dataset in data/: sources, the Belgium-wide overview and each government's budget.
// ABOUTME: Every amount carries a reference to a listed source; amounts are in millions of euro.
import { z } from 'zod';

const nonEmpty = z.string().trim().min(1);

const localized = z.object({ nl: nonEmpty, fr: nonEmpty, en: nonEmpty });

const isoDate = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'expected YYYY-MM or YYYY-MM-DD');

const slug = z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'expected a lowercase id');

export const sourceSchema = z.object({
	id: slug,
	title: nonEmpty,
	publisher: nonEmpty,
	url: z.url({ protocol: /^https$/ }),
	/** Publication date, when the document states one. */
	published: isoDate.optional(),
	retrieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
});

/** Where in a source a figure can be found, e.g. a page or table number. */
export const sourceRefSchema = z.object({
	source: slug,
	locator: nonEmpty,
	/** The line of the source containing the number, copied verbatim, so reviewers can find it. */
	quote: nonEmpty.optional(),
	note: nonEmpty.optional()
});

const amountSchema = z.object({
	eurMillion: z.number().finite().nonnegative(),
	ref: sourceRefSchema
});

const signedAmountSchema = z.object({
	eurMillion: z.number().finite(),
	ref: sourceRefSchema
});

/**
 * How hard a line is to change in practice:
 * entitlement = set by law per person (e.g. pensions), committed = wages, interest, contracts,
 * discretionary = decided in the yearly budget.
 */
export const natureSchema = z.enum(['entitlement', 'committed', 'discretionary']);

/** Parts of the official cost of ageing that have their own projected path. */
export const ageingGroupSchema = z.enum(['pensions', 'health']);

/** A rate as a fraction (0.023 = 2.3%); bounded to catch percentages entered by mistake. */
const rateSchema = z.object({
	value: z.number().min(-0.1).max(0.2),
	ref: sourceRefSchema
});

const yearPointSchema = z.object({
	year: z.number().int(),
	value: z.number().finite(),
	ref: sourceRefSchema
});

const lineSchema = z.object({
	id: slug,
	label: localized,
	amount: amountSchema,
	nature: natureSchema,
	/** Set when this line is money handed to another government in the dataset. */
	transferTo: slug.optional(),
	/** Set when this spending follows an official ageing path, so changing it scales that path's increase. */
	ageingGroup: ageingGroupSchema.optional(),
	note: localized.optional()
});

const entitySchema = z.object({
	id: slug,
	label: localized,
	government: z.enum(['federal', 'social-security', 'region', 'community', 'local']),
	adjustable: z.boolean(),
	/**
	 * provisional = no voted budget; spending runs on provisional credits.
	 * forecast = official forecast, for governments without one budget document (e.g. all municipalities).
	 */
	budgetStatus: z.enum(['initial', 'adjusted', 'provisional', 'forecast']),
	expenditure: z.object({
		total: amountSchema,
		lines: z.array(lineSchema).min(1)
	}),
	note: localized.optional()
});

/** Details behind one spending line, used for its consequence card. */
const lineDetailsSchema = z.object({
	/** The id of the spending line these details belong to, e.g. "social-security.healthcare". */
	line: slug,
	/** Sub-budgets that add up to the line. */
	breakdown: z
		.array(
			z.object({
				id: slug,
				label: localized,
				amount: amountSchema,
				/** Spending matched by equal receipts: cutting it alone saves nothing. */
				offsetByReceipts: z.boolean().optional(),
				note: localized.optional()
			})
		)
		.min(1),
	/** Concrete units ("a GP consultation reimbursed") to express a change in. Shown only once reviewed. */
	equivalents: z.array(
		z.object({
			id: slug,
			label: localized,
			unitEur: z.object({ value: z.number().positive(), ref: sourceRefSchema }),
			/** GitHub handle of the reviewer who approved this example. */
			reviewedBy: nonEmpty.optional()
		})
	),
	/** The official ways this spending can be changed. */
	levers: z.array(
		z.object({ id: slug, label: localized, description: localized, ref: sourceRefSchema })
	)
});

export const datasetSchema = z.object({
	year: z.number().int(),
	sources: z.array(sourceSchema).min(1),
	/** General government (all levels, consolidated, ESA 2010). */
	overview: z.object({
		gdp: amountSchema,
		expenditure: amountSchema,
		revenue: amountSchema,
		balance: signedAmountSchema,
		interest: amountSchema,
		debt: amountSchema,
		/** Legal population on 1 January of the budget year. */
		population: z.object({ persons: z.number().int().positive(), ref: sourceRefSchema })
	}),
	/** Inputs for the static debt projection. */
	outlook: z.object({
		/** Average (implicit) interest rate on the public debt. */
		interestRate: rateSchema,
		/** Nominal GDP growth per year. */
		nominalGrowth: rateSchema,
		/** Official budgetary cost of ageing, % of GDP, for the years the report gives. */
		ageingCostPctGdp: z.array(yearPointSchema).min(1),
		/** Official paths for parts of the ageing cost (pensions, health), % of GDP. */
		ageingGroups: z.array(
			z.object({ id: ageingGroupSchema, points: z.array(yearPointSchema).min(1) })
		),
		/** The official projected debt path, % of GDP, shown as a reference. */
		officialDebtPctGdp: z.array(yearPointSchema).min(1)
	}),
	entities: z.array(entitySchema).min(1),
	details: z.array(lineDetailsSchema)
});

export type Dataset = z.infer<typeof datasetSchema>;
export type Entity = Dataset['entities'][number];
export type Line = Entity['expenditure']['lines'][number];
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type LineDetails = Dataset['details'][number];
