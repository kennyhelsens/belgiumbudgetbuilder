<!--
ABOUTME: Key figures that stay at the top of the screen while visitors change the budget: public debt, deficit, and the
ABOUTME: debt at the end of the outlook with a sparkline, reacting to each change; with the flag and a button to watch the intro.
-->
<script lang="ts">
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { formatEuro } from '../explorer/format.ts';
	import Flag from '../ui/Flag.svelte';
	import type { HeadlineMetrics } from './metrics.ts';

	let {
		metrics,
		year,
		locale,
		reaction,
		onintro
	}: {
		metrics: HeadlineMetrics;
		year: number;
		locale: Locale;
		/** The last change's effect on the debt; a new key replays the animation. */
		reaction?: { debt: 'up' | 'down'; key: number };
		/** Plays the intro again; it sets out why the budget matters, so it stays one click away. */
		onintro?: () => void;
	} = $props();

	const t = (key: MessageKey) => translate(locale, key);
	const percent = (value: number) =>
		new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			value / 100
		);
	const ofGdp = (value: number) => `${percent(value)} ${t('metrics.ofGdp')}`;

	const changed = $derived(metrics.deficit.yours !== metrics.deficit.official);

	// Sparkline geometry: one series (your budget), no axes; the value beside it carries the number.
	const SW = 64;
	const SH = 22;
	const sparkline = $derived.by(() => {
		const values = metrics.path.yours;
		const min = Math.min(...values);
		const span = Math.max(...values) - min || 1;
		return values
			.map((v, i) => {
				const x = 1 + (i / (values.length - 1)) * (SW - 2);
				const y = 1 + (1 - (v - min) / span) * (SH - 2);
				return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join('');
	});
</script>

<section class="figures" aria-label={t('metrics.title')}>
	<div class="figures__row">
		<span class="figures__flag"><Flag size="1.5rem" /></span>
		<div class="metric" data-testid="metric-debt">
			<span class="metric__label">{t('metrics.debt').replace('{year}', String(year))}</span>
			<span class="metric__value">{formatEuro(metrics.debt.eurMillion, locale)}</span>
			<span class="metric__sub">{ofGdp(metrics.debt.pctGdp)}</span>
		</div>
		<div class="metric" data-testid="metric-deficit">
			<span class="metric__label">{t('metrics.deficit').replace('{year}', String(year))}</span>
			{#key reaction?.key}
				<span
					class="metric__value"
					class:metric__value--up={reaction?.debt === 'up'}
					class:metric__value--down={reaction?.debt === 'down'}
					>{formatEuro(metrics.deficit.yours, locale)}</span
				>
			{/key}
			<span class="metric__sub">
				{#if changed}
					{t('metrics.official').replace('{value}', formatEuro(metrics.deficit.official, locale))}
				{:else}
					{ofGdp(metrics.deficit.pctGdp)}
				{/if}
			</span>
		</div>
		<div class="metric metric--trend" data-testid="metric-horizon">
			<span class="metric__label"
				>{t('outlook.debtIn').replace('{year}', String(metrics.horizon.year))}</span
			>
			{#key reaction?.key}
				<span
					class="metric__value"
					class:metric__value--up={reaction?.debt === 'up'}
					class:metric__value--down={reaction?.debt === 'down'}
					>{percent(metrics.horizon.yoursPctGdp)}</span
				>
			{/key}
			<span class="metric__sub">
				{t('metrics.ofGdp')} ·
				{#if changed}
					{t('metrics.unchanged').replace('{value}', percent(metrics.horizon.unchangedPctGdp))}
				{:else}
					{formatEuro(metrics.horizon.yoursEurMillion, locale)}
				{/if}
			</span>
			<svg
				class="metric__spark"
				viewBox="0 0 {SW} {SH}"
				role="img"
				aria-label={t('metrics.pathLabel')
					.replace('{from}', String(year))
					.replace('{to}', String(metrics.horizon.year))}
			>
				<path d={sparkline} />
			</svg>
		</div>
		{#if onintro}
			<!-- On a phone only "Intro" shows; the accessible name stays the full phrase. -->
			<button type="button" class="intro" aria-label={t('intro.replay')} onclick={onintro}>
				<span class="intro__play" aria-hidden="true">▶</span>
				<span class="intro__long" aria-hidden="true">{t('intro.replay')}</span>
				<span class="intro__short" aria-hidden="true">{t('intro.replayShort')}</span>
			</button>
		{/if}
	</div>
</section>

<style>
	/* Scrolling and keyboard focus stop below the bar instead of behind it. */
	:global(html) {
		scroll-padding-top: 6rem;
	}

	.figures {
		position: sticky;
		top: 0;
		z-index: 10;
		margin-top: var(--space-4);
		border-bottom: 1px solid var(--rule);
		background: var(--paper);
	}

	.figures__row {
		display: grid;
		grid-template-columns: auto repeat(3, minmax(0, 1fr)) auto;
		gap: var(--space-3);
		max-width: 64rem;
		margin: 0 auto;
		padding: var(--space-2) var(--gutter);
	}

	.figures__flag {
		display: flex;
		align-self: center;
	}

	.intro {
		display: inline-flex;
		align-self: center;
		align-items: center;
		gap: var(--space-1);
		padding: 0.3em 0.9em;
		border: 1.5px solid var(--ink);
		border-radius: 999px;
		background: none;
		color: var(--ink);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.intro:hover,
	.intro:focus-visible {
		background: var(--ink);
		color: var(--paper);
	}

	.intro__play {
		font-size: 0.75em;
		color: var(--accent);
	}

	.intro__short {
		display: none;
	}

	/* On a phone the button is a small round play sign with a caption, so the three figures keep their width. */
	@media (max-width: 40rem) {
		.intro {
			flex-direction: column;
			gap: 2px;
			padding: 0;
			border: 0;
			font-size: 0.6875rem;
		}

		.intro:hover,
		.intro:focus-visible {
			background: none;
			color: var(--ink);
		}

		.intro__play {
			display: grid;
			place-items: center;
			width: 1.9rem;
			height: 1.9rem;
			border: 1.5px solid var(--ink);
			border-radius: 50%;
			font-size: 0.75rem;
		}

		.intro:hover .intro__play,
		.intro:focus-visible .intro__play {
			background: var(--ink);
		}

		.intro__long {
			display: none;
		}

		/* On a phone every pixel goes to the three figures; the masthead above shows the flag. */
		.figures__flag {
			display: none;
		}

		.intro__short {
			display: inline;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.intro {
			transition: none;
		}
	}

	.metric {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-content: start;
		column-gap: var(--space-2);
	}

	.metric > span {
		grid-column: 1;
	}

	.metric__label,
	.metric__sub {
		color: var(--ink-muted);
		font-size: 0.8125rem;
		line-height: 1.3;
		overflow-wrap: anywhere;
		hyphens: auto;
	}

	.metric__value {
		font-size: var(--text-lg);
		font-weight: 600;
		line-height: 1.2;
	}

	/* The debt rises: the figure wiggles and swells for a moment. */
	.metric__value--up {
		transform-origin: left center;
		animation: debt-up 0.7s ease-out;
	}

	/* The debt falls: the figure settles and shrinks for a moment. */
	.metric__value--down {
		transform-origin: left center;
		animation: debt-down 0.6s ease-out;
	}

	@keyframes debt-up {
		0% {
			transform: scale(1) rotate(0);
		}
		20% {
			transform: scale(1.18) rotate(-3deg);
		}
		40% {
			transform: scale(1.18) rotate(3deg);
		}
		60% {
			transform: scale(1.12) rotate(-2deg);
		}
		100% {
			transform: scale(1) rotate(0);
		}
	}

	@keyframes debt-down {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(0.9);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.metric__value--up,
		.metric__value--down {
			animation: none;
		}
	}

	.metric__spark {
		grid-column: 2;
		grid-row: 1 / span 3;
		align-self: center;
		width: 4rem;
		height: 1.375rem;
		overflow: visible;
	}

	.metric__spark path {
		fill: none;
		stroke: var(--accent);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	@media (max-width: 599px) {
		.figures__row {
			gap: var(--space-2);
		}

		.metric__value {
			font-size: var(--text-base);
		}

		.metric__label,
		.metric__sub {
			font-size: 0.75rem;
		}

		.metric__spark {
			display: none;
		}
	}
</style>
