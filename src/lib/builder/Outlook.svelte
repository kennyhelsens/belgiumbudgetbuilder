<!--
ABOUTME: Ten-year (optionally twenty-year) debt outlook: your budget vs the budget unchanged vs the official projection.
ABOUTME: Headline figures, a line chart with hover values, adjustable assumptions, sources and the model's limits.
-->
<script lang="ts">
	import type { Dataset } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { formatEuro } from '../explorer/format.ts';
	import { project } from '../projection/project.ts';
	import AgeingCost from './AgeingCost.svelte';
	import { balanceChangeFrom, outlookInput, type Changes } from './choices.ts';

	let {
		data,
		locale,
		changes,
		revenue = {},
		onreset,
		years = $bindable(10),
		interestPct = $bindable(undefined),
		growthPct = $bindable(undefined)
	}: {
		data: Dataset;
		locale: Locale;
		changes: Changes;
		/** Revenue changes per type, € million per year; positive = more revenue. */
		revenue?: Changes;
		onreset: () => void;
		years?: number;
		/** Visitor's own assumptions in percent; the sourced values apply when undefined. */
		interestPct?: number;
		growthPct?: number;
	} = $props();

	const t = (key: MessageKey) => translate(locale, key);

	const sourcedInterestPct = $derived(data.outlook.interestRate.value * 100);
	const sourcedGrowthPct = $derived(data.outlook.nominalGrowth.value * 100);

	const assumptions = $derived({
		years,
		interestRate: (interestPct ?? sourcedInterestPct) / 100,
		nominalGrowth: (growthPct ?? sourcedGrowthPct) / 100
	});
	const yours = $derived(project(outlookInput(data, { ...assumptions, changes, revenue })));
	const unchanged = $derived(project(outlookInput(data, { ...assumptions, changes: {} })));
	const official = $derived(data.outlook.officialDebtPctGdp);
	const last = $derived(yours[yours.length - 1]);
	const balanceChange = $derived(balanceChangeFrom(changes, revenue));

	const percent = (value: number) =>
		new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
	const signed = (eurMillion: number) =>
		eurMillion > 0 ? `+${formatEuro(eurMillion, locale)}` : formatEuro(eurMillion, locale);

	// Chart geometry
	const W = 600;
	const H = 260;
	const PAD = { left: 40, right: 16, top: 16, bottom: 28 };
	const allValues = $derived([
		...yours.map((row) => row.debtPctGdp),
		...unchanged.map((row) => row.debtPctGdp),
		...official.map((point) => point.value)
	]);
	const yMin = $derived(Math.floor((Math.min(...allValues) - 5) / 10) * 10);
	const yMax = $derived(Math.ceil((Math.max(...allValues) + 5) / 10) * 10);
	const firstYear = $derived(yours[0].year);
	const lastYear = $derived(last.year);
	const x = (year: number) =>
		PAD.left + ((year - firstYear) / (lastYear - firstYear)) * (W - PAD.left - PAD.right);
	const y = (value: number) =>
		PAD.top + (1 - (value - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
	const path = (rows: { year: number; debtPctGdp: number }[]) =>
		rows.map((row, i) => `${i ? 'L' : 'M'}${x(row.year)},${y(row.debtPctGdp)}`).join('');
	const yTicks = $derived(Array.from({ length: (yMax - yMin) / 10 + 1 }, (_, i) => yMin + i * 10));
	const xTicks = $derived(yours.filter((row) => (row.year - firstYear) % 5 === 0));

	let hoverYear: number | undefined = $state(undefined);
	function onpointermove(event: PointerEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const box = svg.getBoundingClientRect();
		const svgX = ((event.clientX - box.left) / box.width) * W;
		const share = (svgX - PAD.left) / (W - PAD.left - PAD.right);
		const year = Math.round(firstYear + share * (lastYear - firstYear));
		hoverYear = Math.min(lastYear, Math.max(firstYear, year));
	}
	const hovered = $derived(
		hoverYear === undefined
			? undefined
			: {
					year: hoverYear,
					yours: yours.find((row) => row.year === hoverYear)!,
					unchanged: unchanged.find((row) => row.year === hoverYear)!,
					official: official.find((point) => point.year === hoverYear)
				}
	);

	const sourcesById = $derived(new Map(data.sources.map((source) => [source.id, source])));
	const cited = $derived(
		[
			data.overview.debt.ref,
			data.outlook.interestRate.ref,
			data.outlook.nominalGrowth.ref,
			data.outlook.ageingCostPctGdp[0].ref,
			data.outlook.officialDebtPctGdp[0].ref
		]
			.map((ref) => sourcesById.get(ref.source))
			.filter((source, i, all) => source && all.indexOf(source) === i)
	);
</script>

<section class="outlook" aria-labelledby="outlook-title">
	<h2 id="outlook-title">{t('outlook.title')}</h2>
	<p class="outlook__intro">{t('outlook.intro')}</p>

	<fieldset class="horizon">
		<legend>{t('outlook.horizon')}</legend>
		<label><input type="radio" bind:group={years} value={10} /> {t('outlook.years10')}</label>
		<label><input type="radio" bind:group={years} value={20} /> {t('outlook.years20')}</label>
	</fieldset>

	<div class="stats">
		<div class="stat">
			<span class="stat__label">{t('outlook.debtIn').replace('{year}', String(last.year))}</span>
			<span class="stat__value" data-testid="debt-at-horizon"
				>{percent(last.debtPctGdp)} {t('outlook.pctGdp')}</span
			>
			<span class="stat__sub">{formatEuro(last.debt, locale)}</span>
		</div>
		<div class="stat">
			<span class="stat__label">{t('outlook.interestIn').replace('{year}', String(last.year))}</span
			>
			<span class="stat__value">{formatEuro(last.interest, locale)}</span>
			<span class="stat__sub">{percent(last.interestPctGdp)} {t('outlook.pctGdp')}</span>
		</div>
		<div class="stat">
			<span class="stat__label">{t('outlook.balanceChange')}</span>
			<span class="stat__value" data-testid="balance-change">{signed(balanceChange)}</span>
			<button type="button" class="reset" onclick={onreset}>{t('outlook.reset')}</button>
		</div>
	</div>

	<ul class="legend">
		<li><span class="key key--yours"></span>{t('outlook.seriesYours')}</li>
		<li><span class="key key--unchanged"></span>{t('outlook.seriesUnchanged')}</li>
		<li><span class="key key--official"></span>{t('outlook.seriesOfficial')}</li>
	</ul>

	<div class="chart">
		<svg
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label={t('outlook.chartLabel')
				.replace('{from}', String(firstYear))
				.replace('{to}', String(lastYear))}
			{onpointermove}
			onpointerleave={() => (hoverYear = undefined)}
		>
			{#each yTicks as tick (tick)}
				<line class="grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
				<text class="axis" x={PAD.left - 6} y={y(tick)} text-anchor="end" dominant-baseline="middle"
					>{tick}%</text
				>
			{/each}
			{#each xTicks as row (row.year)}
				<text class="axis" x={x(row.year)} y={H - 8} text-anchor="middle">{row.year}</text>
			{/each}
			<path class="line line--unchanged" d={path(unchanged)} />
			<path class="line line--yours" d={path(yours)} />
			{#each official as point (point.year)}
				{#if point.year >= firstYear && point.year <= lastYear}
					<circle class="dot" cx={x(point.year)} cy={y(point.value)} r="4" />
				{/if}
			{/each}
			{#if hovered}
				<line
					class="crosshair"
					x1={x(hovered.year)}
					x2={x(hovered.year)}
					y1={PAD.top}
					y2={H - PAD.bottom}
				/>
			{/if}
		</svg>
		{#if hovered}
			<div class="tooltip" style="left:{(x(hovered.year) / W) * 100}%">
				<strong>{hovered.year}</strong>
				<span>{t('outlook.seriesYours')}: {percent(hovered.yours.debtPctGdp)}%</span>
				<span>{t('outlook.seriesUnchanged')}: {percent(hovered.unchanged.debtPctGdp)}%</span>
				{#if hovered.official}
					<span>{t('outlook.seriesOfficial')}: {percent(hovered.official.value)}%</span>
				{/if}
			</div>
		{/if}
	</div>

	<AgeingCost rows={yours} {locale} />

	<details class="assumptions">
		<summary>{t('outlook.assumptions')}</summary>
		<label>
			{t('outlook.interestRate')}: {percent(interestPct ?? sourcedInterestPct)}%
			<input
				type="range"
				min="0"
				max="6"
				step="0.1"
				value={interestPct ?? sourcedInterestPct}
				oninput={(e) => (interestPct = Number(e.currentTarget.value))}
			/>
		</label>
		<label>
			{t('outlook.growth')}: {percent(growthPct ?? sourcedGrowthPct)}%
			<input
				type="range"
				min="0"
				max="6"
				step="0.1"
				value={growthPct ?? sourcedGrowthPct}
				oninput={(e) => (growthPct = Number(e.currentTarget.value))}
			/>
		</label>
	</details>

	<p class="caveat">{t('outlook.caveat')}</p>
	<p class="sources">
		{t('outlook.sources')}:
		{#each cited as source, i (source!.id)}
			<a href={source!.url} rel="external noopener">{source!.title}</a>{i < cited.length - 1
				? '; '
				: ''}
		{/each}
	</p>
</section>

<style>
	.outlook {
		max-width: 64rem;
		margin: var(--space-6) auto 0;
		padding: 0 var(--gutter);
	}

	h2 {
		font-size: var(--text-xl);
		margin: 0 0 var(--space-2);
	}

	.outlook__intro,
	.caveat,
	.sources {
		max-width: var(--measure);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.caveat {
		padding: var(--space-3) var(--space-4);
		background: var(--paper-raised);
		border-left: 3px solid var(--accent);
		font-style: italic;
	}

	.horizon {
		display: flex;
		gap: var(--space-4);
		margin: var(--space-3) 0;
		padding: 0;
		border: 0;
		font-size: var(--text-sm);
	}

	.horizon legend {
		float: left;
		margin-right: var(--space-2);
		color: var(--ink-muted);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-3);
		margin: var(--space-3) 0;
	}

	.stat {
		display: grid;
		gap: var(--space-1);
		align-content: start;
		padding-top: var(--space-2);
		border-top: 1px solid var(--rule);
	}

	.stat__label,
	.stat__sub {
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.stat__value {
		font-size: var(--text-xl);
		font-variant-numeric: tabular-nums;
	}

	.reset {
		justify-self: start;
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent);
		font: inherit;
		font-size: var(--text-sm);
		text-decoration: underline;
		cursor: pointer;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-sm);
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.key {
		display: inline-block;
		width: 1.5rem;
		height: 0;
		border-top: 2px solid var(--accent);
	}

	.key--unchanged {
		border-top: 2px dashed var(--ink-muted);
	}

	.key--official {
		width: 8px;
		height: 8px;
		border: 0;
		border-radius: 50%;
		background: var(--ink);
	}

	.chart {
		position: relative;
		margin-top: var(--space-2);
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		touch-action: pan-y;
	}

	.grid {
		stroke: var(--rule);
		stroke-width: 1;
	}

	.axis {
		fill: var(--ink-muted);
		font-size: 12px;
	}

	.line {
		fill: none;
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.line--yours {
		stroke: var(--accent);
	}

	.line--unchanged {
		stroke: var(--ink-muted);
		stroke-dasharray: 6 4;
	}

	.dot {
		fill: var(--ink);
		stroke: var(--paper);
		stroke-width: 2;
	}

	.crosshair {
		stroke: var(--ink-muted);
		stroke-width: 1;
	}

	.tooltip {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: grid;
		gap: 2px;
		padding: var(--space-1) var(--space-2);
		background: var(--paper-raised);
		border: 1px solid var(--rule);
		font-size: var(--text-sm);
		white-space: nowrap;
		pointer-events: none;
	}

	.assumptions {
		margin: var(--space-3) 0;
		font-size: var(--text-sm);
	}

	.assumptions summary {
		cursor: pointer;
		color: var(--accent);
	}

	.assumptions label {
		display: grid;
		gap: var(--space-1);
		margin-top: var(--space-2);
	}
</style>
