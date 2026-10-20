<!--
ABOUTME: Localized home page: the mission, key figures that stay in view, the budget map, the outlook and a change notice.
ABOUTME: Text comes from the message files and every figure from the sourced data in data/.
-->
<script lang="ts">
	import KeyFigures from '#lib/builder/KeyFigures.svelte';
	import Outlook from '#lib/builder/Outlook.svelte';
	import type { Changes } from '#lib/builder/choices.ts';
	import { headlineMetrics } from '#lib/builder/metrics.ts';
	import { changeNotice, pickIllustration } from '#lib/builder/notice.ts';
	import { preferReviewed } from '#lib/consequences/consequences.ts';
	import BudgetMap from '#lib/explorer/BudgetMap.svelte';
	import { translate } from '#lib/i18n/translate.ts';
	import Bubbles from '#lib/ui/Bubbles.svelte';
	import Toast from '#lib/ui/Toast.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let changes: Changes = $state({});
	let years = $state(10);
	let interestPct: number | undefined = $state(undefined);
	let growthPct: number | undefined = $state(undefined);
	const metrics = $derived(
		headlineMetrics(data.dataset, {
			changes,
			years,
			interestRate: interestPct === undefined ? undefined : interestPct / 100,
			nominalGrowth: growthPct === undefined ? undefined : growthPct / 100
		})
	);
	// Approved examples first; examples still waiting for review are shown too, by the owners' choice.
	const examplesFor = (id: string) =>
		preferReviewed(data.dataset.details.find((d) => d.line === id)?.equivalents ?? []).map(
			(example) => ({ unitEur: example.unitEur.value, label: example.label[data.locale] })
		);
	// Clicks per line, so every click on the same line is illustrated with something new.
	const clicks: Record<string, number> = {};
	// The last step the visitor took, illustrated by the notice.
	let lastStep = $state<{
		name: string;
		percent: number;
		stepEurMillion: number;
		example?: { unitEur: number; label: string };
	}>();
	let noticeKey = $state(0);
	// How the last change moved the debt: more spending raises it, less spending lowers it.
	let debtMove = $state<'up' | 'down'>();
	const notice = $derived(
		lastStep === undefined
			? undefined
			: changeNotice(data.locale, {
					...lastStep,
					population: data.dataset.overview.population.persons
				})
	);
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="description" content={t('home.lede')} />
</svelte:head>

<main class="article">
	<p class="article__kicker">{t('home.kicker')}</p>
	<h1>{t('home.title')}</h1>
	<p class="article__lede">{t('home.lede')}</p>
	<p class="article__status">{t('home.status')}</p>
</main>

<KeyFigures
	{metrics}
	year={data.dataset.year}
	locale={data.locale}
	reaction={debtMove && { debt: debtMove, key: noticeKey }}
/>
<BudgetMap
	data={data.dataset}
	locale={data.locale}
	bind:changes
	onchange={(change) => {
		const click = clicks[change.id] ?? 0;
		clicks[change.id] = click + 1;
		lastStep = { ...change, example: pickIllustration(examplesFor(change.id), click) };
		debtMove = change.stepEurMillion > 0 ? 'up' : 'down';
		noticeKey += 1;
	}}
/>
<Outlook
	data={data.dataset}
	locale={data.locale}
	{changes}
	onreset={() => (changes = {})}
	bind:years
	bind:interestPct
	bind:growthPct
/>
<Toast message={notice} key={noticeKey} closeLabel={t('builder.noticeClose')} />
<Bubbles burst={debtMove && { mood: debtMove === 'down' ? 'happy' : 'worried', key: noticeKey }} />

<style>
	.article {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-5) var(--gutter) 0;
	}

	.article__kicker {
		margin: 0;
		color: var(--accent);
		font-size: var(--text-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1 {
		margin: var(--space-2) 0 var(--space-4);
		font-size: var(--text-2xl);
	}

	.article__lede {
		font-size: var(--text-lg);
	}

	.article__status {
		padding: var(--space-3) var(--space-4);
		background: var(--paper-raised);
		border-left: 3px solid var(--accent);
		color: var(--ink-muted);
		font-size: var(--text-sm);
		font-style: italic;
	}
</style>
