<!--
ABOUTME: Zoomable, area-true budget map: Belgium's governments, then one government's spending lines.
ABOUTME: Includes a "you are here" minimap, breadcrumbs, −/+ buttons on tiles, and a table with sources and sliders.
-->
<script lang="ts">
	import type { Changes } from '../builder/choices.ts';
	import { formatPercentChange } from '../builder/notice.ts';
	import { CHANGE_LIMIT, changeSlice, stepPercent } from '../builder/steps.ts';
	import ConsequenceCard from '../consequences/ConsequenceCard.svelte';
	import type { Dataset } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { colorSlot } from './colors.ts';
	import { formatEuro } from './format.ts';
	import { mapTiles, type Tile } from './layout.ts';

	let {
		data,
		locale,
		changes = $bindable({}),
		onchange
	}: {
		data: Dataset;
		locale: Locale;
		changes?: Changes;
		/** Called after the visitor changes a line, with its id, name, new percentage and change in € million. */
		onchange?: (change: {
			id: string;
			name: string;
			percent: number;
			changeEurMillion: number;
		}) => void;
	} = $props();

	const percentOf = (id: string, amount: number) => Math.round(((changes[id] ?? 0) / amount) * 100);

	function setPercent(tile: Tile, percent: number) {
		const next = { ...changes };
		if (percent === 0) delete next[tile.id];
		else next[tile.id] = (tile.eurMillion * percent) / 100;
		changes = next;
		onchange?.({
			id: tile.id,
			name: tile.label[locale],
			percent,
			changeEurMillion: next[tile.id] ?? 0
		});
	}

	const signed = (eurMillion: number) =>
		eurMillion > 0 ? `+${formatEuro(eurMillion, locale)}` : formatEuro(eurMillion, locale);

	const t = (key: MessageKey) => translate(locale, key);

	let focus: string | undefined = $state(undefined);
	let width = $state(800);

	const portrait = $derived(width < 600);
	const frame = $derived(portrait ? { width: 300, height: 400 } : { width: 400, height: 250 });

	const tiles = $derived(mapTiles(data, { ...frame, focus }));
	const overviewTiles = $derived(mapTiles(data, { width: 160, height: 100 }));
	const focusEntity = $derived(data.entities.find((entity) => entity.id === focus));
	const shownTotal = $derived(tiles.reduce((sum, tile) => sum + tile.eurMillion, 0));

	const sourcesById = $derived(new Map(data.sources.map((source) => [source.id, source])));

	function lineSource(id: string) {
		const line = focusEntity?.expenditure.lines.find((l) => l.id === id);
		if (!line) return undefined;
		return { source: sourcesById.get(line.amount.ref.source), ref: line.amount.ref };
	}

	function boxStyle(tile: Tile, box: { width: number; height: number }) {
		return [
			`left:${(tile.x0 / box.width) * 100}%`,
			`top:${(tile.y0 / box.height) * 100}%`,
			`width:${((tile.x1 - tile.x0) / box.width) * 100}%`,
			`height:${((tile.y1 - tile.y0) / box.height) * 100}%`,
			`--tile-color:var(--series-${colorSlot(tile.id)})`
		].join(';');
	}

	/** Show the label inside a tile only when it has room; the accessible name always carries it. */
	function hasRoom(tile: Tile) {
		const scale = width / frame.width;
		return (tile.x1 - tile.x0) * scale > 80 && (tile.y1 - tile.y0) * scale > 44;
	}

	/** Large tiles always show their −/+ buttons; small ones only on hover or focus. */
	function hasRoomForSteppers(tile: Tile) {
		const scale = width / frame.width;
		return (tile.x1 - tile.x0) * scale > 160 && (tile.y1 - tile.y0) * scale > 140;
	}

	const share = (amount: number) =>
		new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			amount / shownTotal
		);
</script>

<section class="map" aria-labelledby="map-title">
	<h2 id="map-title">{t('map.title')}</h2>
	<p class="map__intro">{t('map.intro')}</p>

	<nav class="crumbs" aria-label={t('map.breadcrumbLabel')}>
		{#if focusEntity}
			<button type="button" class="crumbs__link" onclick={() => (focus = undefined)}
				>{t('map.belgium')}</button
			>
			<span aria-hidden="true">›</span>
			<span aria-current="location">{focusEntity.label[locale]}</span>
		{:else}
			<span aria-current="location">{t('map.belgium')}</span>
		{/if}
		<span class="crumbs__total">{formatEuro(shownTotal, locale)}</span>
	</nav>
	{#if focusEntity}
		<div
			class="minimap"
			role="img"
			aria-label={t('map.minimapLabel').replace('{name}', focusEntity.label[locale])}
		>
			{#each overviewTiles as tile (tile.id)}
				<span
					class="minimap__tile"
					class:minimap__tile--here={tile.id === focus}
					style={boxStyle(tile, { width: 160, height: 100 })}
				></span>
			{/each}
		</div>
	{/if}

	{#if focusEntity?.budgetStatus === 'provisional'}
		<p class="map__flag">{t('map.provisional')}</p>
	{/if}
	{#if focusEntity && !focusEntity.adjustable}
		<p class="map__flag">{t('map.displayOnly')}</p>
	{/if}

	<div class="map__stage" class:map__stage--portrait={portrait} bind:clientWidth={width}>
		{#each tiles as tile (tile.id)}
			{@const label = `${tile.label[locale]}, ${formatEuro(tile.eurMillion, locale)}`}
			{#if tile.zoomable}
				<button
					type="button"
					class="tile"
					style={boxStyle(tile, frame)}
					aria-label={label}
					onclick={() => (focus = tile.id)}
				>
					{#if hasRoom(tile)}
						<span class="tile__name">{tile.label[locale]}</span>
						<span class="tile__amount">{formatEuro(tile.eurMillion, locale)}</span>
					{/if}
				</button>
			{:else if focusEntity?.adjustable}
				{@const percent = percentOf(tile.id, tile.eurMillion)}
				{@const slice = changeSlice(percent)}
				<div
					class="tile tile--leaf"
					style={boxStyle(tile, frame)}
					role="group"
					aria-label={label}
					tabindex="-1"
				>
					{#if slice}
						<span
							class="tile__slice tile__slice--{slice.kind}"
							style="width: {slice.widthPercent}%"
							data-testid="change-slice"
							data-kind={slice.kind}
						></span>
					{/if}
					{#if hasRoom(tile)}
						<span class="tile__name">{tile.label[locale]}</span>
						<span class="tile__amount"
							>{formatEuro(tile.eurMillion, locale)}{#if percent}
								→ {formatEuro(tile.eurMillion + (changes[tile.id] ?? 0), locale)}{/if}</span
						>
					{/if}
					{#if percent}
						<span class="tile__badge">{formatPercentChange(percent, locale)}</span>
					{/if}
					<span class="stepper" class:stepper--always={hasRoomForSteppers(tile)}>
						<button
							type="button"
							aria-label={t('builder.stepDown').replace('{name}', tile.label[locale])}
							disabled={percent <= -CHANGE_LIMIT}
							onclick={() => setPercent(tile, stepPercent(percent, -1))}>−</button
						>
						<button
							type="button"
							aria-label={t('builder.stepUp').replace('{name}', tile.label[locale])}
							disabled={percent >= CHANGE_LIMIT}
							onclick={() => setPercent(tile, stepPercent(percent, 1))}>+</button
						>
					</span>
				</div>
			{:else}
				<div class="tile tile--leaf" style={boxStyle(tile, frame)} role="img" aria-label={label}>
					{#if hasRoom(tile)}
						<span class="tile__name">{tile.label[locale]}</span>
						<span class="tile__amount">{formatEuro(tile.eurMillion, locale)}</span>
					{/if}
				</div>
			{/if}
		{/each}
	</div>

	<p class="map__note">{t('map.transfersNote')}</p>

	<details class="table-view">
		<summary>{t('map.tableToggle')}</summary>
		<table>
			<thead>
				<tr>
					<th scope="col">{t('map.colItem')}</th>
					<th scope="col" class="num">{t('map.colAmount')}</th>
					<th scope="col" class="num">{t('map.colShare')}</th>
					<th scope="col">{t('map.colSource')}</th>
					{#if focusEntity?.adjustable}
						<th scope="col">{t('builder.change')}</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each tiles as tile (tile.id)}
					{@const cited = lineSource(tile.id)}
					<tr>
						<th scope="row">{tile.label[locale]}</th>
						<td class="num">{formatEuro(tile.eurMillion, locale)}</td>
						<td class="num">{share(tile.eurMillion)}</td>
						<td>
							{#if cited?.source}
								<a class="source" href={cited.source.url} rel="external noopener"
									>{cited.source.title}</a
								>
								<span class="locator">{cited.ref.locator}</span>
							{:else}
								{t('map.sumOfLines')}
							{/if}
						</td>
						{#if focusEntity?.adjustable}
							<td class="change">
								<input
									type="range"
									min={-CHANGE_LIMIT}
									max={CHANGE_LIMIT}
									step="1"
									value={percentOf(tile.id, tile.eurMillion)}
									aria-label={t('builder.sliderLabel').replace('{name}', tile.label[locale])}
									oninput={(e) => setPercent(tile, Number(e.currentTarget.value))}
								/>
								<span class="change__value"
									>{percentOf(tile.id, tile.eurMillion)}% · {signed(changes[tile.id] ?? 0)}</span
								>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</details>

	{#each data.details as details (details.line)}
		{#if changes[details.line]}
			<ConsequenceCard {data} {details} {locale} changeEurMillion={changes[details.line]} />
		{/if}
	{/each}
</section>

<style>
	.map {
		max-width: 64rem;
		margin: var(--space-5) auto 0;
		padding: 0 var(--gutter);
	}

	h2 {
		font-size: var(--text-xl);
		margin: 0 0 var(--space-2);
	}

	.map__intro,
	.map__note {
		max-width: var(--measure);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.map__flag {
		display: inline-block;
		margin: 0 0 var(--space-2);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--rule);
		font-size: var(--text-sm);
		font-style: italic;
	}

	.crumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		margin: var(--space-3) 0 var(--space-2);
		font-size: var(--text-sm);
	}

	.crumbs__link {
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

	.crumbs__total {
		margin-left: auto;
		color: var(--ink-muted);
	}

	.map__stage {
		position: relative;
		aspect-ratio: 400 / 250;
		background: var(--paper);
	}

	.map__stage--portrait {
		aspect-ratio: 300 / 400;
	}

	.tile {
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: var(--space-1);
		margin: 0;
		padding: var(--space-2);
		overflow: hidden;
		border: 0;
		/* 2px paper gap between tiles, identity stripe on top, tinted fill so ink text stays readable. */
		box-shadow: inset 0 0 0 1px var(--paper);
		border-top: 4px solid var(--tile-color);
		background: color-mix(in oklab, var(--tile-color) 22%, var(--paper));
		background-clip: padding-box;
		outline-offset: -3px;
		color: var(--ink);
		font: inherit;
		text-align: left;
		transition:
			left 0.4s ease,
			top 0.4s ease,
			width 0.4s ease,
			height 0.4s ease;
	}

	button.tile {
		cursor: zoom-in;
	}

	button.tile:hover {
		background: color-mix(in oklab, var(--tile-color) 34%, var(--paper));
	}

	.tile__name {
		font-size: var(--text-sm);
		font-weight: 600;
		line-height: 1.2;
	}

	.tile__amount {
		font-size: var(--text-sm);
		color: var(--ink-muted);
	}

	/* The tile keeps its official size; a slice along its right edge marks the change. */
	.tile__slice {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		max-width: 100%;
		pointer-events: none;
	}

	/* A cut: hatched, the money that is no longer there. */
	.tile__slice--cut {
		border-left: 1px dashed var(--ink-muted);
		background: repeating-linear-gradient(
			135deg,
			color-mix(in oklab, var(--ink-muted) 45%, transparent) 0 1.5px,
			var(--paper) 1.5px 6px
		);
	}

	/* An addition: dotted, in a darker shade of the tile colour. */
	.tile__slice--add {
		border-left: 2px solid var(--tile-color);
		background-color: color-mix(in oklab, var(--tile-color) 55%, var(--paper));
		background-image: radial-gradient(var(--ink) 1.1px, transparent 1.5px);
		background-size: 5px 5px;
	}

	.tile__badge {
		position: relative;
		align-self: flex-start;
		padding: 0 var(--space-1);
		background: var(--paper);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.tile__name,
	.tile__amount {
		position: relative;
	}

	.stepper {
		position: absolute;
		right: var(--space-1);
		bottom: var(--space-1);
		z-index: 1;
		display: flex;
		gap: 2px;
		opacity: 0;
		pointer-events: none;
	}

	.tile:hover .stepper,
	.tile:focus-within .stepper,
	.stepper--always {
		opacity: 1;
		pointer-events: auto;
	}

	/* A small tile lets its buttons spill over its neighbours while it is in use. */
	.tile--leaf:hover,
	.tile--leaf:focus-within {
		z-index: 2;
		overflow: visible;
	}

	.stepper button {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 1px solid var(--ink-muted);
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1;
		cursor: pointer;
	}

	.stepper button:hover:not(:disabled) {
		background: color-mix(in oklab, var(--tile-color) 22%, var(--paper));
	}

	.stepper button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.minimap {
		position: relative;
		width: 6rem;
		margin: 0 0 var(--space-2) auto;
		aspect-ratio: 160 / 100;
		border: 1px solid var(--ink-muted);
		background: var(--paper);
	}

	.minimap__tile {
		position: absolute;
		box-shadow: inset 0 0 0 0.5px var(--paper);
		background: color-mix(in oklab, var(--ink-muted) 20%, var(--paper));
	}

	.minimap__tile--here {
		background: var(--tile-color);
	}

	.source {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.locator {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: var(--ink-muted);
		font-size: 0.8125rem;
	}

	.table-view {
		margin-top: var(--space-3);
	}

	.table-view summary {
		cursor: pointer;
		color: var(--accent);
		font-size: var(--text-sm);
	}

	table {
		width: 100%;
		margin-top: var(--space-2);
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	th,
	td {
		padding: var(--space-1) var(--space-2);
		border-bottom: 1px solid var(--rule);
		text-align: left;
		vertical-align: top;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.change {
		min-width: 9rem;
	}

	.change input {
		width: 100%;
	}

	.change__value {
		display: block;
		color: var(--ink-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	@media (max-width: 599px) {
		th:nth-child(3),
		td:nth-child(3) {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tile {
			transition: none;
		}
	}
</style>
