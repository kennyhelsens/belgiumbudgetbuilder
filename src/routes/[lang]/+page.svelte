<!--
ABOUTME: Localized home page: the intro on a first visit, the mission, and the budget builder (key figures, the 10
ABOUTME: billion challenge with a share link, the budget map, the outlook and a change notice).
ABOUTME: Text comes from the message files and every figure from the sourced data in data/.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Builder from '#lib/builder/Builder.svelte';
	import { translate } from '#lib/i18n/translate.ts';
	import Intro from '#lib/intro/Intro.svelte';
	import { SITE_URL } from '#lib/site.ts';
	import { introFacts } from '#lib/intro/facts.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));

	const facts = $derived(introFacts(data.dataset));
	const legend = $derived(
		facts.dots.map(({ id }) => ({
			id,
			label: data.dataset.entities.find((e) => e.id === id)?.label[data.locale] ?? id
		}))
	);
	// A shared budget opens with its choices; the builder says so when it mounts, before the intro is considered.
	let shared = $state(false);

	// The intro opens on a first visit only; the browser remembers that it was seen, nothing more.
	// A shared budget opens straight away: whoever shared it wants it seen.
	const INTRO_SEEN = 'bbb-intro-seen';
	let introOpen = $state(false);
	onMount(() => {
		if (shared) return;
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
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{SITE_URL}/{data.locale}/" />
	<meta property="og:title" content={t('site.title')} />
	<meta property="og:description" content={t('home.lede')} />
	<meta property="og:image" content="{SITE_URL}/og/{data.locale}.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="article">
	<p class="article__kicker">{t('home.kicker')}</p>
	<h1>{t('home.title')}</h1>
	<p class="article__lede">{t('home.lede')}</p>
	<p class="article__status">{t('home.status')}</p>
</main>

<Builder data={data.dataset} locale={data.locale} bind:shared onintro={() => (introOpen = true)} />
<Intro
	{facts}
	{legend}
	year={data.dataset.year}
	locale={data.locale}
	bind:open={introOpen}
	onclose={rememberIntro}
	onstart={showMap}
/>

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

	.article__status {
		padding: var(--space-3) var(--space-4);
		background: var(--paper-raised);
		border-left: 3px solid var(--accent);
		color: var(--ink-muted);
		font-size: var(--text-sm);
		font-style: italic;
	}
</style>
