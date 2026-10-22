<!--
ABOUTME: Consequence card: what a visitor's change to one spending line means, in one plain sentence from that line's
ABOUTME: sourced details, the amounts in small print, where the change would land, and the official levers.
-->
<script lang="ts">
	import type { Dataset, LineDetails } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { formatEuro } from '../explorer/format.ts';
	import { formatPercentChange } from '../builder/notice.ts';
	import { distributeChange, preferReviewed } from './consequences.ts';
	import { amountsLine, asIfSentence, exampleSentence } from './human.ts';

	let {
		data,
		details,
		locale,
		changeEurMillion
	}: { data: Dataset; details: LineDetails; locale: Locale; changeEurMillion: number } = $props();

	const t = (key: MessageKey) => translate(locale, key);

	const line = $derived(
		data.entities.flatMap((entity) => entity.expenditure.lines).find((l) => l.id === details.line)!
	);
	const sourcesById = $derived(new Map(data.sources.map((source) => [source.id, source])));
	const spread = $derived(distributeChange(details.breakdown, changeEurMillion));
	const largestChange = $derived(Math.max(...spread.map((item) => Math.abs(item.change)), 1));
	const signed = (eurMillion: number) =>
		eurMillion > 0 ? `+${formatEuro(eurMillion, locale)}` : formatEuro(eurMillion, locale);
	const percent = $derived((changeEurMillion / line.amount.eurMillion) * 100);
	// One example only: the card tells one thing well rather than many numbers.
	const example = $derived(
		preferReviewed(details.equivalents)
			.slice(0, 1)
			.map((e) => ({ unitEur: e.unitEur.value, label: e.label[locale] }))[0]
	);
	// Benefit lines lead with time for the people who receive them; other lines with an example.
	const lead = $derived(
		details.recipients
			? asIfSentence(locale, details.recipients, percent)
			: example && exampleSentence(locale, 'lead', changeEurMillion, example)
	);
	const also = $derived(
		details.recipients && example
			? exampleSentence(locale, 'also', changeEurMillion, example)
			: undefined
	);
	const titleId = $derived(`consequence-${details.line.replace(/\W/g, '-')}`);
</script>

<section class="card" aria-labelledby={titleId}>
	<h3 id={titleId}>
		{t('consequence.title')
			.replace('{change}', formatPercentChange(Math.round(percent), locale))
			.replace('{name}', line.label[locale])}
	</h3>
	{#if lead}
		<p class="card__lead">{lead}</p>
	{/if}
	{#if also}
		<p class="card__also">{also}</p>
	{/if}
	<p class="card__amounts" data-testid="amounts">
		{amountsLine(locale, changeEurMillion, data.overview.population.persons)}
	</p>

	{#if details.breakdown.length > 0}
		<h4 id="{titleId}-where">{t('consequence.where')}</h4>
		<ul class="spread" aria-labelledby="{titleId}-where">
			{#each details.breakdown as item, i (item.id)}
				<li>
					<span class="spread__label">{item.label[locale]}</span>
					{#if item.offsetByReceipts}
						<span class="spread__offset">{t('consequence.offset')}</span>
					{:else}
						<span class="spread__bar">
							<span
								class="spread__fill"
								class:spread__fill--up={spread[i].change > 0}
								style="width:{(Math.abs(spread[i].change) / largestChange) * 100}%"
							></span>
						</span>
						<span class="spread__value">{signed(spread[i].change)}</span>
					{/if}
				</li>
			{/each}
		</ul>
		<p class="card__note">{t('consequence.whereNote')}</p>
	{/if}

	{#if details.levers.length > 0}
		<div class="levers" role="group" aria-labelledby="{titleId}-how">
			<h4 id="{titleId}-how">{t('consequence.how')}</h4>
			<p class="card__note">{t('consequence.howIntro')}</p>
			{#each details.levers as lever (lever.id)}
				{@const source = sourcesById.get(lever.ref.source)}
				<details class="lever">
					<summary>{lever.label[locale]}</summary>
					<p>{lever.description[locale]}</p>
					{#if source}
						<p class="lever__source">
							{t('consequence.source')}:
							<a href={source.url} rel="external noopener">{source.title}</a>, {lever.ref.locator}
						</p>
					{/if}
				</details>
			{/each}
		</div>
	{/if}
</section>

<style>
	.card {
		margin: var(--space-4) 0;
		padding: var(--space-3) var(--space-4);
		background: var(--paper-raised);
		border-left: 3px solid var(--accent);
	}

	/* The title only names the change; the sentence below it is what the card says. */
	h3 {
		margin: 0;
		color: var(--ink-muted);
		font-family: var(--font-serif);
		font-size: var(--text-sm);
		font-weight: 600;
		letter-spacing: 0;
	}

	h4 {
		margin: var(--space-3) 0 var(--space-2);
		font-size: var(--text-base);
	}

	/* The plain sentence is the point of the card; the amounts are small print. */
	.card__lead {
		margin: var(--space-2) 0 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		line-height: 1.3;
	}

	.card__also {
		margin: var(--space-2) 0 0;
	}

	.card__amounts {
		margin: var(--space-2) 0 0;
		color: var(--ink-muted);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.card__note {
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.spread {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-sm);
	}

	.spread li {
		display: grid;
		grid-template-columns: minmax(8rem, 1.4fr) 2fr minmax(5.5rem, auto);
		gap: var(--space-2);
		align-items: center;
	}

	.spread__bar {
		height: 0.6rem;
		background: color-mix(in oklab, var(--ink-muted) 12%, var(--paper));
	}

	.spread__fill {
		display: block;
		height: 100%;
		background: var(--accent);
	}

	.spread__fill--up {
		background: var(--series-3);
	}

	.spread__value {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.spread__offset {
		grid-column: 2 / 4;
		color: var(--ink-muted);
		font-style: italic;
	}

	.lever {
		padding: var(--space-2) 0;
		border-top: 1px solid var(--rule);
		font-size: var(--text-sm);
	}

	.lever summary {
		cursor: pointer;
		font-weight: 600;
	}

	.lever__source {
		color: var(--ink-muted);
	}

	@media (max-width: 599px) {
		.spread li {
			grid-template-columns: 1fr auto;
		}

		.spread__bar {
			grid-column: 1 / 3;
			grid-row: 2;
		}
	}
</style>
