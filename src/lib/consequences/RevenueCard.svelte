<!--
ABOUTME: Revenue card: what a visitor's change to one type of revenue (a tax, contributions, fees) could mean, in plain
ABOUTME: words and without numbers, from that type's sourced effects. The revenue counterpart of the consequence card.
-->
<script lang="ts">
	import type { Dataset, RevenueType } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';

	let {
		data,
		type,
		locale,
		changeEurMillion
	}: { data: Dataset; type: RevenueType; locale: Locale; changeEurMillion: number } = $props();

	const t = (key: MessageKey) => translate(locale, key);

	const less = $derived(changeEurMillion < 0);
	const effects = $derived((less ? type.effects?.cut : type.effects?.add) ?? []);
	const source = $derived(
		type.effects && data.sources.find((s) => s.id === type.effects?.ref.source)
	);
	const titleId = $derived(`revenue-card-${type.id.replace(/\W/g, '-')}`);
</script>

<section class="card" aria-labelledby={titleId}>
	<h3 id={titleId}>
		{t(less ? 'consequence.lessRevenueTitle' : 'consequence.moreRevenueTitle').replace(
			'{name}',
			type.label[locale]
		)}
	</h3>
	{#if effects.length > 0}
		<ul class="effects">
			{#each effects as effect (effect.en)}
				<li>{effect[locale]}</li>
			{/each}
		</ul>
		<p class="card__note">
			{t('consequence.revenueEffectsNote')}
			{#if source}
				{t('consequence.source')}:
				<a href={source.url} rel="external noopener">{source.title}</a>
			{/if}
		</p>
	{/if}
</section>

<style>
	.card {
		margin: var(--space-4) 0;
		padding: var(--space-3) var(--space-4);
		background: var(--paper-raised);
		border-left: 3px solid var(--accent);
	}

	/* The title only names the change; the phrases below it are what the card says. */
	h3 {
		margin: 0;
		color: var(--ink-muted);
		font-family: var(--font-serif);
		font-size: var(--text-sm);
		font-weight: 600;
		letter-spacing: 0;
	}

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
</style>
