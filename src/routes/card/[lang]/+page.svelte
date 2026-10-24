<!--
ABOUTME: The preview card social networks show for a link to the site, 1200 by 630 pixels: the title, the challenge and
ABOUTME: the map of all governments to scale. scripts/og-images.mjs photographs it into static/og/<lang>.png.
-->
<script lang="ts">
	import { colorSlot } from '#lib/explorer/colors.ts';
	import { formatEuro } from '#lib/explorer/format.ts';
	import { mapGroups, mapTiles } from '#lib/explorer/layout.ts';
	import { translate } from '#lib/i18n/translate.ts';
	import { HEADLINE_EUR_MILLION } from '#lib/intro/facts.ts';
	import { SITE_URL } from '#lib/site.ts';
	import Flag from '#lib/ui/Flag.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const t = (key: Parameters<typeof translate>[1]) => translate(data.locale, key);
	const MAP = { width: 560, height: 550 };
	const tiles = $derived(mapTiles(data.dataset, MAP));
	const groups = $derived(mapGroups(data.dataset, MAP));
	// Governments framed together (federal government and social security) share the colour of the first, as on the map.
	const color = (id: string, group?: string) =>
		`var(--series-${colorSlot(groups.find((g) => g.id === group)?.members[0] ?? id)})`;
	const host = new URL(SITE_URL).host;
	// A name goes on a tile only when it fits; at 22px a character is about 12px wide.
	const fits = (tile: { x0: number; x1: number; y0: number; y1: number }, label: string) =>
		tile.x1 - tile.x0 > label.length * 12 + 28 && tile.y1 - tile.y0 > 50;
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="card" data-testid="og-card">
	<div class="card__text">
		<p class="card__brand"><Flag size="1.1em" /> {t('site.title')}</p>
		<p class="card__kicker">{t('home.kicker')}</p>
		<h1>{t('home.title')}</h1>
		<p class="card__challenge">
			{t('challenge.title').replace('{goal}', formatEuro(HEADLINE_EUR_MILLION, data.locale))}
		</p>
		<p class="card__host">{host}</p>
	</div>
	<svg class="card__map" viewBox="0 0 {MAP.width} {MAP.height}" aria-hidden="true">
		{#each tiles as tile (tile.id)}
			<rect
				x={tile.x0 + 2}
				y={tile.y0 + 2}
				width={Math.max(0, tile.x1 - tile.x0 - 4)}
				height={Math.max(0, tile.y1 - tile.y0 - 4)}
				fill={color(tile.id, tile.group)}
			/>
			{#if fits(tile, tile.label[data.locale])}
				<text x={tile.x0 + 14} y={tile.y0 + 34}>{tile.label[data.locale]}</text>
			{/if}
		{/each}
	</svg>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	.card {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 560px;
		gap: 40px;
		box-sizing: border-box;
		width: 1200px;
		height: 630px;
		padding: 40px;
		overflow: hidden;
		background: var(--paper);
		color: var(--ink);
		border-top: 12px solid var(--accent);
	}

	.card__text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.card__brand {
		margin: 0;
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 700;
	}

	.card__kicker {
		margin: 48px 0 0;
		color: var(--accent);
		font-size: 20px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	h1 {
		margin: 12px 0 0;
		font-family: var(--font-display);
		font-size: 60px;
		font-weight: 900;
		letter-spacing: -0.025em;
		line-height: 1.05;
	}

	.card__challenge {
		margin: 28px 0 0;
		padding: 12px 18px;
		align-self: start;
		background: var(--accent);
		color: var(--paper);
		font-size: 28px;
		font-weight: 700;
	}

	.card__host {
		margin: auto 0 0;
		color: var(--ink-muted);
		font-size: 22px;
	}

	.card__map {
		width: 560px;
		height: 550px;
	}

	.card__map text {
		fill: #fff;
		font-family: var(--font-serif);
		font-size: 22px;
		font-weight: 700;
	}
</style>
