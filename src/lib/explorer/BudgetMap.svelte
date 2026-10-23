<!--
ABOUTME: Zoomable, area-true budget map: Belgium's governments, then one government's spending lines; or revenue by type.
ABOUTME: Includes a "you are here" minimap, breadcrumbs, −/+ buttons on tiles, and a table with sources and sliders.
-->
<script lang="ts">
	import type { Changes } from '../builder/choices.ts';
	import { formatPercentChange } from '../builder/notice.ts';
	import { CHANGE_LIMIT, changeSlice, stepPercent } from '../builder/steps.ts';
	import ConsequenceCard from '../consequences/ConsequenceCard.svelte';
	import RevenueCard from '../consequences/RevenueCard.svelte';
	import type { Dataset } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { colorSlot, LEVELS, levelColor, revenueColor, THEMES, themeColor } from './colors.ts';
	import { formatEuro } from './format.ts';
	import { mapGroups, mapTiles, revenueTiles, tooltipPlacement, type Tile } from './layout.ts';

	let {
		data,
		locale,
		changes = $bindable({}),
		revenue = $bindable({}),
		onchange,
		onopen
	}: {
		data: Dataset;
		locale: Locale;
		changes?: Changes;
		/** Changes to revenue types, € million per year; positive = more revenue. */
		revenue?: Changes;
		/**
		 * Called after the visitor changes a line or revenue type, with its id, name, new percentage, and what this
		 * one step changed in € million (positive = more spending, or more revenue, than before).
		 */
		onchange?: (change: {
			id: string;
			name: string;
			percent: number;
			stepEurMillion: number;
			revenue: boolean;
		}) => void;
		/** Called when the visitor opens a government's tile to see its budget, with the government's id. */
		onopen?: (id: string) => void;
	} = $props();

	/** Spending (governments and their lines) or revenue (by type). */
	let view = $state<'spending' | 'revenue'>('spending');
	const onRevenue = $derived(view === 'revenue');
	// The changes for what is on screen: spending changes, or revenue changes.
	const current = $derived(onRevenue ? revenue : changes);

	const percentOf = (id: string, amount: number) => Math.round(((current[id] ?? 0) / amount) * 100);

	function setPercent(tile: Tile, percent: number) {
		const before = current[tile.id] ?? 0;
		const next = { ...current };
		if (percent === 0) delete next[tile.id];
		else next[tile.id] = (tile.eurMillion * percent) / 100;
		if (onRevenue) revenue = next;
		else changes = next;
		onchange?.({
			id: tile.id,
			name: tile.label[locale],
			percent,
			stepEurMillion: (next[tile.id] ?? 0) - before,
			revenue: onRevenue
		});
	}

	const signed = (eurMillion: number) =>
		eurMillion > 0 ? `+${formatEuro(eurMillion, locale)}` : formatEuro(eurMillion, locale);

	const t = (key: MessageKey) => translate(locale, key);

	let focus: string | undefined = $state(undefined);
	let width = $state(800);

	const portrait = $derived(width < 600);
	const frame = $derived(portrait ? { width: 300, height: 400 } : { width: 400, height: 250 });

	const tiles = $derived(
		onRevenue ? revenueTiles(data, frame) : mapTiles(data, { ...frame, focus })
	);
	const overviewTiles = $derived(mapTiles(data, { width: 160, height: 100 }));
	// The government opened on the spending map; it stays open while the visitor looks at revenue.
	const focusEntity = $derived(
		onRevenue ? undefined : data.entities.find((entity) => entity.id === focus)
	);
	// Whether the tiles on screen can be changed: revenue, or the lines of a government that can be.
	const editable = $derived(onRevenue || focusEntity?.adjustable === true);
	const fixedText = $derived(t(onRevenue ? 'builder.revenueFixed' : 'builder.fixed'));
	const shownTotal = $derived(tiles.reduce((sum, tile) => sum + tile.eurMillion, 0));
	// The phone list: largest first, each bar as long as its amount against the largest.
	const byAmount = $derived([...tiles].sort((a, b) => b.eurMillion - a.eurMillion));
	const barWidth = (tile: Tile) => (tile.eurMillion / (byAmount[0]?.eurMillion || 1)) * 100;

	// Governments the Planning Bureau reports together (Entity I and II), largest first; none inside a government.
	const groupBoxes = $derived(onRevenue ? [] : mapGroups(data, { ...frame, focus }));
	const groupsById = $derived(new Map(data.groups.map((group) => [group.id, group])));
	const groupTotal = (id: string) =>
		tiles.filter((tile) => tile.group === id).reduce((sum, tile) => sum + tile.eurMillion, 0);
	// The phone list in sections: one per group, then anything outside a group.
	const sections = $derived([
		...groupBoxes.map((box) => ({
			id: box.id,
			group: groupsById.get(box.id),
			tiles: byAmount.filter((tile) => tile.group === box.id)
		})),
		{ id: 'ungrouped', group: undefined, tiles: byAmount.filter((tile) => !tile.group) }
	]);

	/** Which levels of government collect a revenue type, as percentages of what they collect together. */
	function levelShares(id: string) {
		const amounts = data.revenue.types.find((type) => type.id === id)?.byLevel?.amounts ?? [];
		const total = amounts.reduce((sum, { amount }) => sum + amount.eurMillion, 0);
		return amounts.map(({ level, amount }) => ({
			level,
			percent: (amount.eurMillion / total) * 100
		}));
	}

	const sourcesById = $derived(new Map(data.sources.map((source) => [source.id, source])));

	function lineSource(id: string) {
		const line = onRevenue
			? data.revenue.types.find((type) => type.id === id)
			: focusEntity?.expenditure.lines.find((l) => l.id === id);
		if (!line) return undefined;
		return { source: sourcesById.get(line.amount.ref.source), ref: line.amount.ref };
	}

	/** Governments in their own colour; lines inside a government in the colour of their theme; revenue neutral. */
	const tileColor = (tile: Pick<Tile, 'id' | 'theme' | 'adjustable'>) =>
		onRevenue
			? revenueColor(tile.adjustable)
			: tile.theme
				? themeColor(tile.theme)
				: `var(--series-${colorSlot(tile.id)})`;
	// The themes on screen, for the legend, in the legend's fixed order.
	const shownThemes = $derived(
		THEMES.filter((theme) => tiles.some((tile) => tile.theme === theme))
	);

	type Rect = { x0: number; y0: number; x1: number; y1: number };

	function position(rect: Rect, box: { width: number; height: number }) {
		return [
			`left:${(rect.x0 / box.width) * 100}%`,
			`top:${(rect.y0 / box.height) * 100}%`,
			`width:${((rect.x1 - rect.x0) / box.width) * 100}%`,
			`height:${((rect.y1 - rect.y0) / box.height) * 100}%`
		].join(';');
	}

	function boxStyle(tile: Tile, box: { width: number; height: number }) {
		return `${position(tile, box)};--tile-color:${tileColor(tile)}`;
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

	/** The tile whose tooltip is open: one that cannot show its own name and amount in full. */
	let tip: Tile | undefined = $state(undefined);

	function showTip(tile: Tile, element: HTMLElement) {
		const clipped =
			element.scrollHeight > element.clientHeight + 1 ||
			element.scrollWidth > element.clientWidth + 1;
		tip = !hasRoom(tile) || clipped ? tile : undefined;
	}

	function hideTip(tile: Tile) {
		if (tip?.id === tile.id) tip = undefined;
	}

	/** Hover, keyboard focus and tap (which focuses the tile) all open the tooltip. */
	const tipEvents = (tile: Tile) => ({
		onpointerenter: (event: PointerEvent) => showTip(tile, event.currentTarget as HTMLElement),
		onpointerleave: () => hideTip(tile),
		onfocusin: (event: FocusEvent) => showTip(tile, event.currentTarget as HTMLElement),
		onfocusout: () => hideTip(tile)
	});

	$effect(() => {
		void focus;
		tip = undefined;
	});

	function tipStyle(tile: Tile) {
		const place = tooltipPlacement(tile, frame);
		const horizontal =
			place.horizontal === 'left'
				? `left:${(tile.x0 / frame.width) * 100}%`
				: `right:${(1 - tile.x1 / frame.width) * 100}%`;
		const vertical =
			place.vertical === 'below'
				? `top:${(tile.y1 / frame.height) * 100}%`
				: `bottom:${(1 - tile.y0 / frame.height) * 100}%`;
		return `${horizontal};${vertical}`;
	}

	const share = (amount: number) =>
		new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			amount / shownTotal
		);
</script>

<section class="map" aria-labelledby="map-title">
	<h2 id="map-title">{t('map.title')}</h2>
	<div class="views" role="group" aria-label={t('map.viewLabel')}>
		<button
			type="button"
			class="views__button"
			aria-pressed={!onRevenue}
			onclick={() => (view = 'spending')}>{t('map.viewSpending')}</button
		>
		<button
			type="button"
			class="views__button"
			aria-pressed={onRevenue}
			onclick={() => (view = 'revenue')}>{t('map.viewRevenue')}</button
		>
	</div>
	<p class="map__intro">{t(onRevenue ? 'map.revenueIntro' : 'map.intro')}</p>

	{#if focusEntity}
		<button type="button" class="map__back" onclick={() => (focus = undefined)}>
			<span aria-hidden="true">←</span>
			{t('map.back')}
		</button>
	{/if}
	<nav class="crumbs" aria-label={t('map.breadcrumbLabel')}>
		{#if focusEntity}
			<button type="button" class="crumbs__link" onclick={() => (focus = undefined)}
				>{t('map.belgium')}</button
			>
			<span aria-hidden="true">›</span>
			<span aria-current="location">{focusEntity.label[locale]}</span>
		{:else if onRevenue}
			<span aria-current="location">{t('map.viewRevenue')}</span>
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

	{#if focusEntity?.note}
		<p class="map__entity-note" data-testid="entity-note">{focusEntity.note[locale]}</p>
	{/if}

	{#if focusEntity?.nationalAccounts}
		{@const reference = focusEntity.nationalAccounts}
		{@const source = sourcesById.get(reference.ref.source)}
		<p class="map__reference" data-testid="national-accounts">
			{t('map.nationalAccounts')}: <strong>{formatEuro(reference.eurMillion, locale)}</strong>
			{#if source}
				· <a href={source.url} rel="external noopener">{t('map.nationalAccountsSource')}</a>
			{/if}
			<span class="map__reference-why">{t('map.nationalAccountsWhy')}</span>
		</p>
	{/if}

	{#if focusEntity?.budgetStatus === 'provisional'}
		<p class="map__flag">{t('map.provisional')}</p>
	{/if}
	{#if focusEntity && !focusEntity.adjustable}
		<p class="map__flag">{t('map.displayOnly')}</p>
	{/if}

	{#snippet levelStrip(tile: Tile)}
		<!-- Who collects this revenue; the legend names the levels and the card gives the amounts. -->
		<span class="levels" data-testid="level-strip" aria-hidden="true">
			{#each levelShares(tile.id) as share (share.level)}
				<span
					class="levels__part"
					data-level={share.level}
					style="width:{share.percent}%;background:{levelColor(share.level)}"
				></span>
			{/each}
		</span>
	{/snippet}

	{#snippet stepper(tile: Tile, percent: number, always: boolean)}
		<span class="stepper" class:stepper--always={always}>
			<button
				type="button"
				aria-label={t(onRevenue ? 'builder.revenueStepDown' : 'builder.stepDown').replace(
					'{name}',
					tile.label[locale]
				)}
				disabled={percent <= -CHANGE_LIMIT}
				onclick={() => setPercent(tile, stepPercent(percent, -1))}>−</button
			>
			<button
				type="button"
				aria-label={t(onRevenue ? 'builder.revenueStepUp' : 'builder.stepUp').replace(
					'{name}',
					tile.label[locale]
				)}
				disabled={percent >= CHANGE_LIMIT}
				onclick={() => setPercent(tile, stepPercent(percent, 1))}>+</button
			>
		</span>
	{/snippet}

	<div class="map__stage" class:map__stage--list={portrait} bind:clientWidth={width}>
		{#if portrait}
			<!-- On a phone a treemap is too narrow to read: rows under each other, each with a bar to scale. -->
			{#snippet barList(list: Tile[])}
				<ol class="bars">
					{#each list as tile (tile.id)}
						{@const label = `${tile.label[locale]}, ${formatEuro(tile.eurMillion, locale)}`}
						{@const percent = percentOf(tile.id, tile.eurMillion)}
						{@const changeable = !tile.zoomable && editable && tile.adjustable}
						{#snippet barRow()}
							<span class="bar__head">
								<span class="bar__name">{tile.label[locale]}</span>
								<span class="bar__amount"
									>{formatEuro(tile.eurMillion, locale)}{#if percent}
										→ {formatEuro(tile.eurMillion + (current[tile.id] ?? 0), locale)}
										<span class="bar__badge">{formatPercentChange(percent, locale)}</span
										>{/if}</span
								>
							</span>
							<span class="bar__foot">
								<span class="bar__track"
									><span class="bar__fill" style="width:{barWidth(tile)}%"></span></span
								>
								{#if changeable}
									{@render stepper(tile, percent, true)}
								{:else if !tile.zoomable}
									<!-- Keeps every bar in a government equally long, with or without buttons. -->
									<span class="bar__spacer"></span>
								{/if}
							</span>
							{#if onRevenue}
								{@render levelStrip(tile)}
							{/if}
							{#if !tile.zoomable && editable && !tile.adjustable}
								<span class="bar__fixed">{fixedText}</span>
							{/if}
						{/snippet}
						<li class="bar" data-testid="bar-row" style="--tile-color:{tileColor(tile)}">
							{#if tile.zoomable}
								<button
									type="button"
									class="bar__body bar__body--open"
									aria-label={label}
									onclick={() => {
										focus = tile.id;
										onopen?.(tile.id);
									}}>{@render barRow()}</button
								>
							{:else if changeable}
								<div class="bar__body" role="group" aria-label={label}>{@render barRow()}</div>
							{:else}
								<div class="bar__body" role="img" aria-label={label}>{@render barRow()}</div>
							{/if}
						</li>
					{/each}
				</ol>
			{/snippet}
			{#each sections as section (section.id)}
				{#if section.group}
					<section class="bars-group" aria-labelledby="bars-group-{section.id}">
						<h3 class="bars-group__title" id="bars-group-{section.id}">
							{section.group.label[locale]}
							<span class="bars-group__total">{formatEuro(groupTotal(section.id), locale)}</span>
						</h3>
						{@render barList(section.tiles)}
					</section>
				{:else if section.tiles.length > 0}
					{@render barList(section.tiles)}
				{/if}
			{/each}
		{:else}
			{#each tiles as tile (tile.id)}
				{@const label = `${tile.label[locale]}, ${formatEuro(tile.eurMillion, locale)}`}
				{#if tile.zoomable}
					<button
						type="button"
						class="tile"
						style={boxStyle(tile, frame)}
						aria-label={label}
						onclick={() => {
							focus = tile.id;
							onopen?.(tile.id);
						}}
						{...tipEvents(tile)}
					>
						{#if hasRoom(tile)}
							{#if tile.group}
								<span class="tile__group">{groupsById.get(tile.group)?.short[locale]}</span>
							{/if}
							<span class="tile__name">{tile.label[locale]}</span>
							<span class="tile__amount">{formatEuro(tile.eurMillion, locale)}</span>
						{/if}
					</button>
				{:else if editable && tile.adjustable}
					{@const percent = percentOf(tile.id, tile.eurMillion)}
					{@const slice = changeSlice(percent)}
					<div
						class="tile tile--leaf"
						class:tile--small={!hasRoom(tile)}
						style={boxStyle(tile, frame)}
						role="group"
						aria-label={label}
						tabindex="-1"
						{...tipEvents(tile)}
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
									→ {formatEuro(tile.eurMillion + (current[tile.id] ?? 0), locale)}{/if}</span
							>
						{/if}
						{#if percent}
							<span class="tile__badge">{formatPercentChange(percent, locale)}</span>
						{/if}
						{#if onRevenue}
							{@render levelStrip(tile)}
						{/if}
						{@render stepper(tile, percent, hasRoomForSteppers(tile))}
					</div>
				{:else}
					<div
						class="tile tile--leaf"
						style={boxStyle(tile, frame)}
						role="img"
						aria-label={label}
						{...tipEvents(tile)}
					>
						{#if hasRoom(tile)}
							<span class="tile__name">{tile.label[locale]}</span>
							<span class="tile__amount">{formatEuro(tile.eurMillion, locale)}</span>
							{#if editable && !tile.adjustable}
								<span class="tile__fixed">{fixedText}</span>
							{/if}
						{/if}
						{#if onRevenue}
							{@render levelStrip(tile)}
						{/if}
					</div>
				{/if}
			{/each}
			{#each groupBoxes as box (box.id)}
				<span
					class="group-box"
					data-testid="group-box"
					aria-hidden="true"
					style={position(box, frame)}
				></span>
			{/each}
			{#if tip}
				{@const percent = percentOf(tip.id, tip.eurMillion)}
				<div class="tile-tip" role="tooltip" style={tipStyle(tip)}>
					<strong>{tip.label[locale]}</strong>
					<span
						>{formatEuro(tip.eurMillion, locale)}{#if percent}
							→ {formatEuro(tip.eurMillion + (current[tip.id] ?? 0), locale)}{/if}
						· {share(tip.eurMillion)}</span
					>
					{#if editable && !tip.adjustable}
						<span>{fixedText}</span>
					{/if}
				</div>
			{/if}
		{/if}
	</div>

	{#if groupBoxes.length > 0 && !portrait}
		<ul class="groups" aria-label={t('map.groupsLabel')}>
			{#each groupBoxes as box (box.id)}
				<li class="groups__item">
					<strong>{groupsById.get(box.id)?.label[locale]}</strong>
					<span class="groups__total">{formatEuro(groupTotal(box.id), locale)}</span>
				</li>
			{/each}
		</ul>
	{/if}

	{#if onRevenue}
		<ul class="legend" aria-label={t('map.levelsLabel')}>
			{#each LEVELS as level (level)}
				<li class="legend__item" style="--tile-color:{levelColor(level)}">
					{t(`level.${level}` as MessageKey)}
				</li>
			{/each}
		</ul>
	{/if}

	{#if shownThemes.length > 0}
		<ul class="legend" aria-label={t('map.legendLabel')}>
			{#each shownThemes as theme (theme)}
				<li class="legend__item" style="--tile-color:{themeColor(theme)}">
					{t(`theme.${theme}` as MessageKey)}
				</li>
			{/each}
		</ul>
	{/if}

	<p class="map__note">{t(onRevenue ? 'map.revenueNote' : 'map.transfersNote')}</p>

	<details class="table-view">
		<summary>{t('map.tableToggle')}</summary>
		<table>
			<thead>
				<tr>
					<th scope="col">{t('map.colItem')}</th>
					<th scope="col" class="num">{t('map.colAmount')}</th>
					<th scope="col" class="num">{t('map.colShare')}</th>
					<th scope="col">{t('map.colSource')}</th>
					{#if editable}
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
						{#if editable && !tile.adjustable}
							<td class="change change--fixed">{fixedText}</td>
						{:else if editable}
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
									>{percentOf(tile.id, tile.eurMillion)}% · {signed(current[tile.id] ?? 0)}</span
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
	{#each data.revenue.types as type (type.id)}
		{#if revenue[type.id]}
			<RevenueCard {data} {type} {locale} changeEurMillion={revenue[type.id]} />
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

	.map__reference {
		margin: 0 0 var(--space-2);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.map__reference strong {
		color: var(--ink);
	}

	.map__reference-why {
		display: block;
		font-size: 0.8125rem;
	}

	.map__flag {
		display: inline-block;
		margin: 0 0 var(--space-2);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--rule);
		font-size: var(--text-sm);
		font-style: italic;
	}

	/* A frame around the governments the Planning Bureau reports together; it lets clicks through to the tiles. */
	.group-box {
		position: absolute;
		box-sizing: border-box;
		border: 3px solid var(--ink);
		pointer-events: none;
	}

	/* The group a government belongs to, in small capitals above its name. */
	.tile__group {
		display: block;
		color: var(--ink-muted);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-4);
		margin: var(--space-2) 0 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-sm);
	}

	.groups__item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.groups__item::before {
		content: '';
		width: 0.875rem;
		height: 0.875rem;
		border: 3px solid var(--ink);
		box-sizing: border-box;
	}

	.groups__total {
		color: var(--ink-muted);
	}

	.bars-group + .bars-group {
		margin-top: var(--space-4);
	}

	.bars-group__title {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-1) var(--space-2);
		margin: 0 0 var(--space-2);
		padding-bottom: var(--space-1);
		border-bottom: 3px solid var(--ink);
		font-size: var(--text-base);
	}

	.bars-group__total {
		color: var(--ink-muted);
		font-weight: 400;
	}

	.map__entity-note {
		max-width: var(--measure);
		margin: 0 0 var(--space-2);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	/* Spending or revenue: two buttons joined into one switch; the chosen one is filled. */
	.views {
		display: inline-flex;
		margin: 0 0 var(--space-2);
		border: 1px solid var(--ink);
	}

	.views__button {
		padding: var(--space-1) var(--space-3);
		border: 0;
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 160ms ease,
			color 160ms ease;
	}

	.views__button + .views__button {
		border-left: 1px solid var(--ink);
	}

	.views__button[aria-pressed='true'] {
		background: var(--ink);
		color: var(--paper);
	}

	.views__button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.views__button {
			transition: none;
		}
	}

	.map__back {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		margin: var(--space-3) 0 0;
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--ink);
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}

	.map__back:hover {
		background: var(--ink);
		color: var(--paper);
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

	/* The phone list has no fixed shape: rows take the height they need. */
	.map__stage--list {
		aspect-ratio: auto;
	}

	.bars {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.bar__body {
		display: grid;
		gap: var(--space-1);
		width: 100%;
		padding: var(--space-2) 0;
		border: 0;
		border-top: 1px solid var(--rule);
		background: none;
		color: var(--ink);
		font: inherit;
		text-align: left;
	}

	.bar__body--open {
		cursor: pointer;
	}

	/* Name and amount share a line; a long amount moves below the name rather than squeezing it. */
	.bar__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0 var(--space-2);
	}

	.bar__name {
		font-weight: 600;
		overflow-wrap: break-word;
	}

	.bar__amount {
		margin-left: auto;
		color: var(--ink-muted);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.bar__badge {
		margin-left: var(--space-1);
		color: var(--ink);
		font-weight: 700;
	}

	.bar__foot {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.bar__track {
		flex: 1;
		height: 0.75rem;
		background: color-mix(in oklab, var(--tile-color) 12%, var(--paper));
	}

	.bar__fill {
		display: block;
		height: 100%;
		background: var(--tile-color);
		transition: width 0.3s ease;
	}

	/* As wide as the − and + buttons. */
	.bar__spacer {
		flex: 0 0 calc(4rem + 2px);
	}

	.bar__fixed {
		color: var(--ink-muted);
		font-size: var(--text-sm);
		font-style: italic;
	}

	/* In the list the buttons sit beside the bar, always in view. */
	.bar .stepper {
		position: static;
	}

	/* Who collects a revenue type: a thin strip along the bottom of its tile, one part per level. */
	.levels {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		height: 8px;
	}

	.levels__part {
		height: 100%;
	}

	.bar .levels {
		position: static;
		margin-top: var(--space-1);
		height: 5px;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
		margin: var(--space-2) 0 0;
		padding: 0;
		list-style: none;
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.legend__item::before {
		content: '';
		display: inline-block;
		width: 0.75em;
		height: 0.75em;
		margin-right: 0.4em;
		background: var(--tile-color);
		vertical-align: -0.05em;
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

	.tile__fixed {
		color: var(--ink-muted);
		font-size: 0.8125rem;
		font-style: italic;
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

	/* A small tile lets its buttons spill over its neighbours while it is in use; its name is in the tooltip. */
	.tile--small:hover,
	.tile--small:focus-within {
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

	.tile-tip {
		position: absolute;
		z-index: 5;
		display: grid;
		gap: 2px;
		max-width: min(18rem, 90%);
		margin: 4px 0;
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--rule);
		background: var(--paper-raised);
		box-shadow: 0 2px 8px color-mix(in oklab, var(--ink) 15%, transparent);
		font-size: var(--text-sm);
		pointer-events: none;
	}

	.tile-tip span {
		color: var(--ink-muted);
		font-variant-numeric: tabular-nums;
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

	.change--fixed {
		color: var(--ink-muted);
		font-style: italic;
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
