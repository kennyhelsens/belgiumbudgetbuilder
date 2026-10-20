<!--
ABOUTME: The cost of ageing: how much more pensions and healthcare cost each year than in the start year.
ABOUTME: Headline amounts at the horizon and stacked columns per year, from the projection rows (so visitor changes count).
-->
<script lang="ts">
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { formatEuro } from '../explorer/format.ts';
	import type { ProjectionRow } from '../projection/project.ts';

	let { rows, locale }: { rows: ProjectionRow[]; locale: Locale } = $props();

	const t = (key: MessageKey) => translate(locale, key);

	const GROUPS = [
		{ id: 'pensions', label: 'ageing.pensions', color: 'var(--series-7)' },
		{ id: 'health', label: 'ageing.health', color: 'var(--series-3)' },
		{ id: 'other', label: 'ageing.other', color: 'var(--ink-muted)' }
	] as const;

	const last = $derived(rows[rows.length - 1]);
	const euroOf = (row: ProjectionRow, id: string) =>
		((row.ageingExtraPctGdp[id] ?? 0) / 100) * row.gdp;

	const percent = (value: number) =>
		new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);

	// Chart geometry: one column per year, positive parts stacked up from zero, negative parts down.
	const W = 600;
	const H = 200;
	const PAD = { left: 40, right: 8, top: 12, bottom: 24 };
	const extremes = $derived(
		rows.map((row) => {
			const parts = GROUPS.map((g) => row.ageingExtraPctGdp[g.id] ?? 0);
			return {
				up: parts.filter((v) => v > 0).reduce((s, v) => s + v, 0),
				down: parts.filter((v) => v < 0).reduce((s, v) => s + v, 0)
			};
		})
	);
	const yMax = $derived(Math.max(0.5, ...extremes.map((e) => e.up)));
	const yMin = $derived(Math.min(0, ...extremes.map((e) => e.down)));
	const y = (value: number) =>
		PAD.top + ((yMax - value) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
	const slot = $derived((W - PAD.left - PAD.right) / rows.length);
	const barWidth = $derived(Math.max(2, slot - 4));

	function segments(row: ProjectionRow) {
		let up = 0;
		let down = 0;
		return GROUPS.map((group) => {
			const value = row.ageingExtraPctGdp[group.id] ?? 0;
			const from = value >= 0 ? up : down;
			const to = from + value;
			if (value >= 0) up = to;
			else down = to;
			return { ...group, top: y(Math.max(from, to)), height: Math.abs(y(from) - y(to)) };
		});
	}

	const ticks = $derived(
		Array.from({ length: Math.floor(yMax) - Math.ceil(yMin) + 1 }, (_, i) => Math.ceil(yMin) + i)
	);
</script>

<div class="ageing">
	<h3>{t('ageing.title')}</h3>
	<p class="ageing__intro">{t('ageing.intro')}</p>

	<p class="ageing__headline">
		<span class="ageing__label">{t('ageing.extraIn').replace('{year}', String(last.year))}</span>
		<span class="ageing__total"
			>{formatEuro(euroOf(last, 'total'), locale)} · {percent(last.ageingExtraPctGdp.total)}%</span
		>
		<span class="ageing__sub">{t('ageing.perYear')}</span>
	</p>

	<ul class="legend">
		{#each GROUPS as group (group.id)}
			<li>
				<span class="key" style="background:{group.color}"></span>
				{t(group.label)}:
				<span data-testid="ageing-{group.id}">{formatEuro(euroOf(last, group.id), locale)}</span>
			</li>
		{/each}
	</ul>

	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label={t('ageing.chartLabel')
			.replace('{from}', String(rows[0].year))
			.replace('{to}', String(last.year))}
	>
		{#each ticks as tick (tick)}
			<line
				class="grid"
				class:zero={tick === 0}
				x1={PAD.left}
				x2={W - PAD.right}
				y1={y(tick)}
				y2={y(tick)}
			/>
			<text class="axis" x={PAD.left - 6} y={y(tick)} text-anchor="end" dominant-baseline="middle"
				>{tick}%</text
			>
		{/each}
		{#each rows as row, i (row.year)}
			{#each segments(row) as part (part.id)}
				{#if part.height > 0}
					<rect
						x={PAD.left + i * slot + (slot - barWidth) / 2}
						y={part.top}
						width={barWidth}
						height={part.height}
						fill={part.color}
					>
						<title
							>{row.year} · {t(part.label)}: {percent(row.ageingExtraPctGdp[part.id] ?? 0)}%</title
						>
					</rect>
				{/if}
			{/each}
			{#if (row.year - rows[0].year) % 5 === 0}
				<text class="axis" x={PAD.left + i * slot + slot / 2} y={H - 6} text-anchor="middle"
					>{row.year}</text
				>
			{/if}
		{/each}
	</svg>

	<p class="ageing__note">{t('ageing.scaled')}</p>
</div>

<style>
	.ageing {
		margin: var(--space-5) 0 var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--rule);
	}

	h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
	}

	.ageing__intro,
	.ageing__note {
		max-width: var(--measure);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.ageing__headline {
		display: grid;
		gap: var(--space-1);
		margin: var(--space-3) 0;
	}

	.ageing__label,
	.ageing__sub {
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.ageing__total {
		font-size: var(--text-xl);
		font-variant-numeric: tabular-nums;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin: 0 0 var(--space-2);
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
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 2px;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.grid {
		stroke: var(--rule);
		stroke-width: 1;
	}

	.grid.zero {
		stroke: var(--ink-muted);
	}

	.axis {
		fill: var(--ink-muted);
		font-size: 12px;
	}

	rect {
		stroke: var(--paper);
		stroke-width: 1;
	}
</style>
