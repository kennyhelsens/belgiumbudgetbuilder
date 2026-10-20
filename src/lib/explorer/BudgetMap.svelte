<!--
ABOUTME: Zoomable, area-true budget map: Belgium's governments, then one government's spending lines.
ABOUTME: Includes a "you are here" minimap when zoomed, breadcrumbs, and an equivalent table with sources.
-->
<script lang="ts">
	import type { Dataset } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { colorSlot } from './colors.ts';
	import { formatEuro } from './format.ts';
	import { mapTiles, type Tile } from './layout.ts';

	let { data, locale }: { data: Dataset; locale: Locale } = $props();

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
								<a href={cited.source.url} rel="external noopener">{cited.source.title}</a>,
								{cited.ref.locator}
							{:else}
								{t('map.sumOfLines')}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
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
		position: absolute;
		right: var(--space-2);
		bottom: var(--space-2);
		width: 6rem;
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
