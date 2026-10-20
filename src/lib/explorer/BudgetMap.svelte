<!--
ABOUTME: Zoomable, area-true budget map: Belgium's governments, then one government's spending lines.
ABOUTME: Includes a "you are here" minimap, breadcrumbs, and a table with sources and per-line budget sliders.
-->
<script lang="ts">
	import type { Changes } from '../builder/choices.ts';
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
		changes = $bindable({})
	}: { data: Dataset; locale: Locale; changes?: Changes } = $props();

	const percentOf = (id: string, amount: number) => Math.round(((changes[id] ?? 0) / amount) * 100);

	function setPercent(id: string, amount: number, percent: number) {
		const next = { ...changes };
		if (percent === 0) delete next[id];
		else next[id] = (amount * percent) / 100;
		changes = next;
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
									min="-50"
									max="50"
									step="5"
									value={percentOf(tile.id, tile.eurMillion)}
									aria-label={t('builder.sliderLabel').replace('{name}', tile.label[locale])}
									oninput={(e) =>
										setPercent(tile.id, tile.eurMillion, Number(e.currentTarget.value))}
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
