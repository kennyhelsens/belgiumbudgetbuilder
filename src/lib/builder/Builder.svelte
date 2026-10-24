<!--
ABOUTME: The budget builder: key figures that stay in view, the 10 billion challenge with a share link, the budget map,
ABOUTME: the outlook, a notice after each change, and anonymous click counts. Used by the home page and the embed.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import type { Dataset } from '../data/schema.ts';
	import BudgetMap from '../explorer/BudgetMap.svelte';
	import type { Locale } from '../i18n/locales.ts';
	import { translate } from '../i18n/translate.ts';
	import { ClickLog, trackingAllowed } from '../tracking/clicklog.ts';
	import Bubbles from '../ui/Bubbles.svelte';
	import Toast from '../ui/Toast.svelte';
	import Challenge from './Challenge.svelte';
	import type { Changes } from './choices.ts';
	import KeyFigures from './KeyFigures.svelte';
	import { headlineMetrics } from './metrics.ts';
	import { changeNotice, pickEffect } from './notice.ts';
	import Outlook from './Outlook.svelte';
	import { decodeChoices, encodeChoices } from './share.ts';

	let {
		data,
		locale,
		onintro,
		shared = $bindable(false)
	}: {
		data: Dataset;
		locale: Locale;
		/** Plays the intro again, from the key figures; without it there is no intro button. */
		onintro?: () => void;
		/** Whether the budget on screen came from a shared link; set when the builder mounts. */
		shared?: boolean;
	} = $props();

	let changes: Changes = $state({});
	let revenue: Changes = $state({});
	let years = $state(10);
	let interestPct: number | undefined = $state(undefined);
	let growthPct: number | undefined = $state(undefined);
	const metrics = $derived(
		headlineMetrics(data, {
			changes,
			revenue,
			years,
			interestRate: interestPct === undefined ? undefined : interestPct / 100,
			nominalGrowth: growthPct === undefined ? undefined : growthPct / 100
		})
	);
	// What a cut or an increase to a line or revenue type could mean, in plain words, in the page's language.
	const effectsFor = (id: string, cut: boolean) => {
		const effects =
			data.details.find((d) => d.line === id)?.effects ??
			data.revenue.types.find((type) => type.id === id)?.effects;
		return ((cut ? effects?.cut : effects?.add) ?? []).map((effect) => effect[locale]);
	};
	// Clicks per line, so every click on the same line tells something new.
	const clicks: Record<string, number> = {};
	// The last step the visitor took, illustrated by the notice.
	let lastStep = $state<{
		name: string;
		percent: number;
		stepEurMillion: number;
		revenue: boolean;
		effect?: string;
	}>();
	let noticeKey = $state(0);
	// How the last change moved the debt: more spending or less revenue raises it, the opposite lowers it.
	let debtMove = $state<'up' | 'down'>();
	const notice = $derived(lastStep === undefined ? undefined : changeNotice(locale, lastStep));
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(locale, key));

	// A budget shared as a link opens with its choices; the address keeps the choices on screen, so it can be copied.
	let addressReady = $state(false);
	const encoded = $derived(encodeChoices(data, { changes, revenue }));
	onMount(() => {
		const choices = decodeChoices(data, new URLSearchParams(location.search).get('b'));
		if (Object.keys(choices.changes).length + Object.keys(choices.revenue).length > 0) {
			changes = choices.changes;
			revenue = choices.revenue;
			shared = true;
		}
		addressReady = true;
	});
	$effect(() => {
		if (!addressReady) return;
		const search = encoded === '' ? '' : `?${new URLSearchParams({ b: encoded })}`;
		if (location.search === search) return;
		// Only the query changes; the path stays the page's own (with its trailing slash).
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- same page, new query.
		replaceState(`${location.pathname}${search}`, {});
	});
	function startAgain() {
		changes = {};
		revenue = {};
		shared = false;
	}

	// Anonymous tile clicks, to learn which budgets people look at, cut or add to; see the FAQ on privacy.
	let clickLog: ClickLog | undefined;
	onMount(() => {
		const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
		if (!trackingAllowed(nav)) return;
		const log = new ClickLog(locale, (body) =>
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
</script>

<KeyFigures
	{metrics}
	year={data.year}
	{locale}
	reaction={debtMove && { debt: debtMove, key: noticeKey }}
	{onintro}
/>
<Challenge {data} {locale} {changes} {revenue} {shared} onrestart={startAgain} />
<BudgetMap
	{data}
	{locale}
	bind:changes
	bind:revenue
	onopen={(id) => clickLog?.record(id, 'open', 0)}
	onchange={(change) => {
		clickLog?.record(change.id, change.stepEurMillion < 0 ? 'cut' : 'add', change.percent);
		const click = clicks[change.id] ?? 0;
		clicks[change.id] = click + 1;
		lastStep = {
			...change,
			effect: pickEffect(effectsFor(change.id, change.stepEurMillion < 0), click)
		};
		debtMove = change.stepEurMillion > 0 !== change.revenue ? 'up' : 'down';
		noticeKey += 1;
	}}
/>
<Outlook
	{data}
	{locale}
	{changes}
	{revenue}
	onreset={startAgain}
	bind:years
	bind:interestPct
	bind:growthPct
/>
<Toast message={notice} key={noticeKey} closeLabel={t('builder.noticeClose')} />
<Bubbles burst={debtMove && { mood: debtMove === 'down' ? 'happy' : 'worried', key: noticeKey }} />
