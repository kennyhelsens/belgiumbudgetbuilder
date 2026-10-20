<!--
ABOUTME: Localized home page: states the site's mission while the budget explorer is being built.
ABOUTME: All text comes from the message files; no figures appear here.
-->
<script lang="ts">
	import { translate } from '#lib/i18n/translate.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="description" content={t('home.lede')} />
</svelte:head>

<main class="article">
	<p class="article__kicker">{t('home.kicker')}</p>
	<h1>{t('home.title')}</h1>
	<p class="article__lede">{t('home.lede')}</p>
	<p class="article__status">{t('home.status')}</p>
</main>

<style>
	.article {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-5) var(--gutter) 0;
	}

	.article__kicker {
		margin: 0;
		color: var(--accent);
		font-size: var(--text-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1 {
		margin: var(--space-2) 0 var(--space-4);
		font-size: var(--text-2xl);
	}

	.article__lede {
		font-size: var(--text-lg);
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
