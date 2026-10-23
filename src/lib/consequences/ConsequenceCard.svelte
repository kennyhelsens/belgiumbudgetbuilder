<!--
ABOUTME: Consequence card: what a visitor's change to one spending line could mean, in plain words and without numbers,
ABOUTME: from that line's sourced details; with where the change would land and the official levers where known.
-->
<script lang="ts">
	import type { Dataset, LineDetails } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { distributeChange } from './consequences.ts';

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
	const cut = $derived(changeEurMillion < 0);
	const effects = $derived((cut ? details.effects?.cut : details.effects?.add) ?? []);
	const effectsSource = $derived(details.effects && sourcesById.get(details.effects.ref.source));
	const titleId = $derived(`consequence-${details.line.replace(/\W/g, '-')}`);
</script>

<section class="card" aria-labelledby={titleId}>
	<h3 id={titleId}>
		{t(cut ? 'consequence.cutTitle' : 'consequence.addTitle').replace('{name}', line.label[locale])}
	</h3>
	{#if effects.length > 0}
		<ul class="effects">
			{#each effects as effect (effect.en)}
				<li>{effect[locale]}</li>
			{/each}
		</ul>
		<p class="card__note">
			{t('consequence.effectsNote')}
			{#if effectsSource}
				{t('consequence.source')}:
				<a href={effectsSource.url} rel="external noopener">{effectsSource.title}</a>
			{/if}
		</p>
	{/if}

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

	/* The possible effects are what the card says; everything else is small print. */
	.effects {
		margin: var(--space-2) 0 0;
		padding-left: var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		line-height: 1.3;
	}

	.effects li + li {
		margin-top: var(--space-1);
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
		grid-template-columns: minmax(8rem, 1.4fr) 2fr;
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

	.spread__offset {
		grid-column: 2;
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
			grid-template-columns: 1fr;
		}

		.spread__bar,
		.spread__offset {
			grid-column: 1;
		}
	}
</style>
