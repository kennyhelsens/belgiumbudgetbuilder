<!--
ABOUTME: Localized home page: the intro on a first visit, the mission, key figures that stay in view, the budget map,
ABOUTME: the outlook and a change notice.
ABOUTME: Text comes from the message files and every figure from the sourced data in data/.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import KeyFigures from '#lib/builder/KeyFigures.svelte';
	import Outlook from '#lib/builder/Outlook.svelte';
	import type { Changes } from '#lib/builder/choices.ts';
	import { headlineMetrics } from '#lib/builder/metrics.ts';
	import { changeNotice, pickEffect } from '#lib/builder/notice.ts';
	import BudgetMap from '#lib/explorer/BudgetMap.svelte';
	import { translate } from '#lib/i18n/translate.ts';
	import Intro from '#lib/intro/Intro.svelte';
	import { introFacts } from '#lib/intro/facts.ts';
	import { ClickLog, trackingAllowed } from '#lib/tracking/clicklog.ts';
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
	// What a cut or an increase to a line could mean, in plain words, in the page's language.
	const effectsFor = (id: string, cut: boolean) => {
		const effects = data.dataset.details.find((d) => d.line === id)?.effects;
		return ((cut ? effects?.cut : effects?.add) ?? []).map((effect) => effect[data.locale]);
	};
	// Clicks per line, so every click on the same line tells something new.
	const clicks: Record<string, number> = {};
	// The last step the visitor took, illustrated by the notice.
	let lastStep = $state<{
		name: string;
		percent: number;
		stepEurMillion: number;
		effect?: string;
	}>();
	let noticeKey = $state(0);
	// How the last change moved the debt: more spending raises it, less spending lowers it.
	let debtMove = $state<'up' | 'down'>();
	const notice = $derived(lastStep === undefined ? undefined : changeNotice(data.locale, lastStep));
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));

	const facts = $derived(introFacts(data.dataset));
	const legend = $derived(
		facts.dots.map(({ id }) => ({
			id,
			label: data.dataset.entities.find((e) => e.id === id)?.label[data.locale] ?? id
		}))
	);
	// The intro opens on a first visit only; the browser remembers that it was seen, nothing more.
	const INTRO_SEEN = 'bbb-intro-seen';
	let introOpen = $state(false);
	onMount(() => {
		try {
			introOpen = localStorage.getItem(INTRO_SEEN) === null;
		} catch {
			// Storage can be blocked; then the intro stays closed and can still be opened by hand.
		}
	});
	function rememberIntro() {
		try {
			localStorage.setItem(INTRO_SEEN, '1');
		} catch {
			// Nothing to remember without storage.
		}
	}
	// Anonymous tile clicks, to learn which budgets people look at, cut or add to; see the FAQ on privacy.
	let clickLog: ClickLog | undefined;
	onMount(() => {
		const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
		if (!trackingAllowed(nav)) return;
		const log = new ClickLog(data.locale, (body) =>
			navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }))
		);
		clickLog = log;
		const flush = () => log.flush();
		addEventListener('pagehide', flush);
		const onHidden = () => document.visibilityState === 'hidden' && log.flush();
		document.addEventListener('visibilitychange', onHidden);
		return () => {
			log.flush();
			removeEventListener('pagehide', flush);
			document.removeEventListener('visibilitychange', onHidden);
		};
	});

	function showMap() {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		document
			.getElementById('map-title')
			?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="description" content={t('home.lede')} />
</svelte:head>

<main class="article">
	<p class="article__kicker">{t('home.kicker')}</p>
	<h1>{t('home.title')}</h1>
	<p class="article__lede">{t('home.lede')}</p>
	<button type="button" class="article__replay" onclick={() => (introOpen = true)}>
		<span aria-hidden="true">▶</span>
		{t('intro.replay')}
	</button>
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
	onopen={(id) => clickLog?.record(id, 'open', 0)}
	onchange={(change) => {
		clickLog?.record(change.id, change.stepEurMillion < 0 ? 'cut' : 'add', change.percent);
		const click = clicks[change.id] ?? 0;
		clicks[change.id] = click + 1;
		lastStep = {
			...change,
			effect: pickEffect(effectsFor(change.id, change.stepEurMillion < 0), click)
		};
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
<Intro
	{facts}
	{legend}
	year={data.dataset.year}
	locale={data.locale}
	bind:open={introOpen}
	onclose={rememberIntro}
	onstart={showMap}
/>
<Toast message={notice} key={noticeKey} closeLabel={t('builder.noticeClose')} />
<Bubbles burst={debtMove && { mood: debtMove === 'down' ? 'happy' : 'worried', key: noticeKey }} />

<style>
	.article {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-5) var(--gutter) 0;
	}

	/* A label above the headline: crimson bar, small bold capitals. */
	.article__kicker {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		color: var(--accent);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.article__kicker::before {
		content: '';
		width: 1.5rem;
		height: 0.375rem;
		background: var(--accent);
	}

	h1 {
		margin: var(--space-2) 0 var(--space-4);
		font-size: clamp(2.25rem, 7vw, 3.75rem);
		font-weight: 900;
		letter-spacing: -0.025em;
	}

	.article__lede {
		font-size: var(--text-lg);
	}

	/* The headline block rises in on load, line after line. */
	.article > * {
		animation: rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}

	.article > :nth-child(2) {
		animation-delay: 0.08s;
	}

	.article > :nth-child(3) {
		animation-delay: 0.16s;
	}

	.article > :nth-child(n + 4) {
		animation-delay: 0.24s;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.article > * {
			animation: none;
		}
	}

	.article__replay {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		padding: 0.5em 1.1em;
		border: 1.5px solid var(--ink);
		border-radius: 999px;
		background: none;
		color: var(--ink);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.article__replay:hover,
	.article__replay:focus-visible {
		background: var(--ink);
		color: var(--paper);
	}

	.article__replay span {
		font-size: 0.75em;
		color: var(--accent);
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
