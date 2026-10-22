<!--
ABOUTME: The intro shown on a first visit: what a "10 billion" headline means, told in seven steps on a grid of
ABOUTME: one dot per billion of public spending. A modal dialog that can be skipped, closed with Escape and replayed.
-->
<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion, Tween } from 'svelte/motion';
	import { colorSlot } from '../explorer/colors.ts';
	import { formatEuro } from '../explorer/format.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import type { IntroFacts } from './facts.ts';
	import { fill, introScenes, introValues, SCENE_COUNT, type SceneId } from './scenes.ts';

	let {
		facts,
		year,
		locale,
		legend,
		open = $bindable(false),
		onclose,
		onstart
	}: {
		facts: IntroFacts;
		year: number;
		locale: Locale;
		/** The governments in the grid, with their names, largest first. */
		legend: { id: string; label: string }[];
		open?: boolean;
		/** Called whenever the intro closes: skipped, Escape or finished. */
		onclose?: () => void;
		/** Called when the visitor finishes the intro and asks for the budget map. */
		onstart?: () => void;
	} = $props();

	const t = (key: MessageKey) => translate(locale, key);
	const scenes = $derived(introScenes(facts, year, locale));
	const values = $derived(introValues(facts, year, locale));
	let scene = $state(0);
	const id = $derived(scenes[scene].id);
	let dialog: HTMLDialogElement;

	const COLUMNS = 20;
	const GAP = 10;
	// One entry per dot, in the order of the legend; the story's highlights take the last and the first dots.
	const dots = $derived.by(() => {
		const owners = facts.dots.flatMap((d) => Array.from({ length: d.dots }, () => d.id));
		const count = owners.length;
		const headlineDots = Math.round(facts.headline.eurMillion / 1000);
		return owners.map((id, i) => ({
			slot: colorSlot(id),
			x: (i % COLUMNS) * GAP + GAP / 2,
			y: Math.floor(i / COLUMNS) * GAP + GAP / 2,
			fromEnd: count - 1 - i,
			headline: i >= count - headlineDots,
			deficit: i >= count - facts.deficit.dots,
			interest: i < facts.interest.dots
		}));
	});
	const rows = $derived(Math.ceil(dots.length / COLUMNS));

	// The total counts up when the grid first appears.
	const total = new Tween(0, { duration: 1400, easing: cubicOut });
	$effect(() => {
		if (scene >= 1) {
			total.set(facts.totalEurMillion, { duration: prefersReducedMotion.current ? 0 : 1400 });
		}
	});

	// The big number above the grid, per step.
	const figure = $derived(
		(
			{
				all: formatEuro(total.current, locale),
				ten: values.share,
				gap: values.deficit,
				why: values.widening,
				bill: values.interest
			} as Partial<Record<SceneId, string>>
		)[id]
	);

	// What the highlighted dots mean while the government colours are switched off.
	const storyKeys = $derived(
		(
			(
				{
					ten: [['headline', 'intro.keyHeadline']],
					gap: [
						['headline', 'intro.keyHeadline'],
						['deficit', 'intro.keyDeficit']
					],
					why: [['deficit', 'intro.keyDeficit']],
					bill: [
						['interest', 'intro.keyInterest'],
						['deficit', 'intro.keyDeficit']
					]
				} as Partial<Record<SceneId, [string, MessageKey][]>>
			)[id] ?? []
		).map(([kind, key]) => ({ kind, label: fill(t(key), values) }))
	);

	// Why the deficit grew: the part from lower revenue, in percent of the bar.
	const revenuePct = $derived(
		(facts.widening.lowerRevenue / (facts.widening.lowerRevenue + facts.widening.higherSpending)) *
			100
	);

	$effect(() => {
		if (open && !dialog.open) {
			scene = 0;
			total.set(0, { duration: 0 });
			dialog.showModal();
			// Focus the dialog itself rather than its first button, so arrow keys work and no ring flashes on "Skip".
			dialog.focus();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	function go(step: number) {
		scene = Math.min(SCENE_COUNT - 1, Math.max(0, scene + step));
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') go(1);
		if (event.key === 'ArrowLeft') go(-1);
	}

	function start() {
		dialog.close();
		onstart?.();
	}
</script>

<dialog
	bind:this={dialog}
	class="intro"
	aria-label={t('intro.label')}
	tabindex="-1"
	data-scene={id}
	{onkeydown}
	onclose={() => {
		open = false;
		onclose?.();
	}}
>
	<header class="intro__bar">
		<span class="intro__brand">{t('site.title')}</span>
		<ol class="intro__progress" aria-hidden="true">
			{#each scenes as step, i (step.id)}
				<li class:done={i <= scene}></li>
			{/each}
		</ol>
		<button type="button" class="intro__skip" onclick={() => dialog.close()}
			>{t('intro.skip')}</button
		>
	</header>

	<div class="intro__stage">
		{#key scene}
			<div class="intro__copy">
				{#if scenes[scene].kicker}
					<p class="intro__kicker">{scenes[scene].kicker}</p>
				{/if}
				<h2 class="intro__title">{scenes[scene].title}</h2>
				<p class="intro__body">{scenes[scene].body}</p>
				{#if id === 'why' && facts.widening.sourceUrl}
					<p class="intro__source">
						<a href={facts.widening.sourceUrl} rel="external noopener">{t('intro.why.source')}</a>
					</p>
				{/if}
			</div>
		{/key}

		<figure class="intro__visual" aria-hidden="true">
			{#if figure}
				<p class="intro__figure">{figure}</p>
			{/if}
			{#if id === 'why'}
				<div class="split" data-testid="intro-split">
					<span class="split__part split__part--revenue" style:width="{revenuePct}%"
						>{t('intro.why.revenue')} <b>{values.lowerRevenue}</b></span
					>
					<span class="split__part split__part--spending" style:width="{100 - revenuePct}%"
						>{t('intro.why.spending')} <b>{values.higherSpending}</b></span
					>
				</div>
			{/if}
			<svg class="grid" viewBox="0 0 {COLUMNS * GAP} {rows * GAP}" role="presentation">
				{#each dots as dot, i (i)}
					<circle
						class="dot"
						data-testid="intro-dot"
						data-headline={dot.headline || undefined}
						data-deficit={dot.deficit || undefined}
						data-interest={dot.interest || undefined}
						cx={dot.x}
						cy={dot.y}
						r="3.6"
						style="--i: {i}; --j: {dot.fromEnd}; --c: var(--series-{dot.slot})"
					/>
				{/each}
			</svg>
			<figcaption class="intro__legend">
				<span class="intro__unit">{t('intro.dotLegend')}</span>
				{#if storyKeys.length}
					{#each storyKeys as key (key.kind)}
						<span class="intro__key intro__key--{key.kind}">{key.label}</span>
					{/each}
				{:else}
					{#each legend as item (item.id)}
						<span class="intro__key" style="--c: var(--series-{colorSlot(item.id)})"
							>{item.label}</span
						>
					{/each}
				{/if}
			</figcaption>
		</figure>
	</div>

	<footer class="intro__nav">
		<button
			type="button"
			class="intro__back"
			onclick={() => go(-1)}
			style:visibility={scene === 0 ? 'hidden' : 'visible'}>← {t('intro.back')}</button
		>
		<span class="intro__step"
			>{t('intro.progress')
				.replace('{n}', String(scene + 1))
				.replace('{total}', String(SCENE_COUNT))}</span
		>
		{#if scene < SCENE_COUNT - 1}
			<button type="button" class="intro__next" onclick={() => go(1)}>{t('intro.next')} →</button>
		{:else}
			<button type="button" class="intro__next" onclick={start}>{t('intro.start')} →</button>
		{/if}
	</footer>
</dialog>

<style>
	.intro {
		--dot-muted: color-mix(in srgb, var(--ink) 13%, var(--paper));
		width: 100vw;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: var(--paper);
		color: var(--ink);
		overflow: hidden;
	}

	.intro[open] {
		display: grid;
		grid-template-rows: auto 1fr auto;
		animation: intro-in 0.5s ease-out;
	}

	.intro::backdrop {
		background: var(--paper);
	}

	.intro__bar,
	.intro__nav {
		display: flex;
		background: var(--paper);
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: var(--space-3) var(--gutter);
	}

	.intro__bar {
		border-bottom: 4px solid var(--ink);
	}

	.intro__brand {
		font-family: var(--font-display);
		font-weight: 900;
		letter-spacing: -0.02em;
		white-space: nowrap;
	}

	.intro__progress {
		display: flex;
		flex: 1;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.intro__progress li {
		flex: 1;
		height: 0.25rem;
		background: var(--rule);
		transition: background 0.4s ease;
	}

	.intro__progress li.done {
		background: var(--accent);
	}

	.intro button {
		font: inherit;
		cursor: pointer;
	}

	.intro__skip,
	.intro__back {
		padding: var(--space-1) 0;
		border: 0;
		background: none;
		color: var(--ink-muted);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.intro__next {
		margin-left: auto;
		padding: 0.6em 1.2em;
		border: 0;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-weight: 700;
		transition: transform 0.15s ease;
	}

	.intro__next:hover {
		transform: translateX(3px);
	}

	.intro__step {
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	/* Only the middle scrolls, so the progress bar and the buttons stay in reach on small screens. */
	.intro__stage {
		display: grid;
		gap: var(--space-4);
		align-content: center;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: var(--space-4) var(--gutter);
	}

	@media (min-width: 52rem) {
		.intro__stage {
			grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
			align-items: center;
			gap: var(--space-6);
		}
	}

	/* Text: each step rises in, kicker, title and body one after the other. */
	.intro__copy > * {
		animation: rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}

	.intro__copy > :nth-child(2) {
		animation-delay: 0.08s;
	}

	.intro__copy > :nth-child(3) {
		animation-delay: 0.18s;
	}

	.intro__kicker {
		margin: 0 0 var(--space-2);
		color: var(--accent);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.intro__title {
		margin: 0 0 var(--space-3);
		padding: 0;
		border: 0;
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 900;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.intro__body {
		margin: 0;
		font-size: var(--text-lg);
		line-height: 1.5;
		text-wrap: pretty;
	}

	/* Step 1: the headline as a newspaper clipping that drops onto the page. */
	.intro[data-scene='headline'] .intro__copy {
		padding: var(--space-4);
		background: var(--paper-raised);
		border-top: 4px solid var(--ink);
		box-shadow: 0 1.25rem 2.5rem -1.5rem rgb(0 0 0 / 0.35);
		transform: rotate(-1.2deg);
		animation: clipping 0.8s cubic-bezier(0.2, 0.8, 0.2, 1.1) both;
	}

	.intro[data-scene='headline'] .intro__title {
		font-size: clamp(2.25rem, 7vw, 4.25rem);
	}

	.intro__visual {
		margin: 0;
		min-width: 0;
	}

	/* Step 1 has only the clipping, centred; the grid waits out of sight, rendered, so its dots can pop in. */
	.intro[data-scene='headline'] .intro__stage {
		grid-template-columns: minmax(0, 46rem);
		justify-content: center;
	}

	.intro[data-scene='headline'] .intro__visual {
		position: absolute;
		width: min(36rem, 90vw);
		visibility: hidden;
	}

	.intro__figure {
		margin: 0 0 var(--space-2);
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 900;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
		animation: rise 0.5s ease-out both;
	}

	.grid {
		display: block;
		width: 100%;
		height: auto;
		max-height: 55dvh;
		overflow: visible;
	}

	.dot {
		fill: var(--c);
		stroke: transparent;
		stroke-width: 1.4;
		transform-box: fill-box;
		transform-origin: center;
		transition:
			fill 0.45s ease,
			stroke 0.45s ease,
			opacity 0.45s ease,
			transform 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
	}

	/* Step 1: no grid yet. Step 2: every billion pops in, in order. */
	.intro[data-scene='headline'] .dot {
		opacity: 0;
		transform: scale(0.2);
	}

	.intro[data-scene='all'] .dot {
		transition-delay: calc(var(--i) * 2.5ms);
	}

	/* Steps 3 to 5: the colours step back so the highlighted billions stand out. */
	.intro[data-scene='ten'] .dot,
	.intro[data-scene='gap'] .dot,
	.intro[data-scene='why'] .dot,
	.intro[data-scene='bill'] .dot {
		fill: var(--dot-muted);
	}

	.intro[data-scene='ten'] .dot[data-headline],
	.intro[data-scene='gap'] .dot[data-headline] {
		fill: var(--accent);
		transform: scale(1.2);
		transition-delay: calc(var(--j) * 70ms + 250ms);
	}

	.intro[data-scene='gap'] .dot[data-deficit]:not([data-headline]),
	.intro[data-scene='why'] .dot[data-deficit],
	.intro[data-scene='bill'] .dot[data-deficit] {
		fill: transparent;
		stroke: var(--accent);
		transition-delay: calc(var(--j) * 25ms);
	}

	.intro[data-scene='bill'] .dot[data-interest] {
		fill: var(--ink);
		transform: scale(1.15);
		transition-delay: calc(var(--i) * 40ms + 200ms);
	}

	.intro[data-scene='choices'] .dot {
		transition-delay: calc(var(--j) * 2ms);
	}

	/* Why the deficit grew: one bar split into less revenue and more spending. */
	.split {
		display: flex;
		gap: 3px;
		margin-bottom: var(--space-3);
		font-size: var(--text-sm);
		line-height: 1.3;
	}

	.split__part {
		padding: var(--space-2);
		min-width: 0;
		color: var(--paper);
		transform-origin: left;
		animation: grow 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}

	.split__part b {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		white-space: nowrap;
	}

	.split__part--revenue {
		background: var(--ink);
	}

	.split__part--spending {
		background: var(--accent);
		animation-delay: 0.25s;
	}

	.intro__source {
		margin-top: var(--space-3);
		font-size: var(--text-sm);
	}

	.intro__source a {
		color: var(--ink-muted);
	}

	.intro__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		color: var(--ink-muted);
		transition: opacity 0.4s ease;
	}

	.intro[data-scene='headline'] .intro__legend {
		opacity: 0;
	}

	.intro__unit {
		color: var(--ink);
		font-weight: 600;
	}

	.intro__key::before {
		content: '';
		display: inline-block;
		width: 0.6em;
		height: 0.6em;
		margin-right: 0.35em;
		border-radius: 50%;
		background: var(--c);
	}

	.intro__key--headline::before {
		background: var(--accent);
	}

	.intro__key--deficit::before {
		background: transparent;
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.intro__key--interest::before {
		background: var(--ink);
	}

	.intro:focus {
		outline: none;
	}

	@media (max-width: 40rem) {
		.intro__brand {
			display: none;
		}
	}

	@media (max-width: 52rem) {
		.intro__stage {
			align-content: start;
		}

		.grid {
			max-height: 38dvh;
		}

		.intro__body {
			font-size: var(--text-base);
		}
	}

	@keyframes intro-in {
		from {
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
	}

	@keyframes grow {
		from {
			transform: scaleX(0);
		}
	}

	@keyframes clipping {
		from {
			opacity: 0;
			transform: rotate(-7deg) scale(1.12) translateY(-1.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.intro,
		.intro *,
		.intro__copy > * {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
