<!--
ABOUTME: The FAQ page: how every number on the site is made, rendered from docs/FAQ.md.
ABOUTME: The content is English in every language; Dutch and French pages say so above it.
-->
<script lang="ts">
	import { translate } from '#lib/i18n/translate.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));
</script>

<svelte:head>
	<title>{t('faq.title')} · {t('site.title')}</title>
</svelte:head>

<main class="faq">
	<h1>{t('faq.title')}</h1>
	{#if data.locale !== 'en'}
		<p class="faq__note">{t('faq.englishOnly')}</p>
	{/if}
	<!-- The HTML comes from our own docs/FAQ.md, rendered at build time. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="faq__body" lang="en">{@html data.html}</div>
</main>

<style>
	.faq {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-5) var(--gutter) 0;
	}

	.faq h1 {
		font-size: clamp(2rem, 6vw, 3rem);
		font-weight: 900;
		letter-spacing: -0.025em;
	}

	.faq__note {
		padding: var(--space-2) var(--space-3);
		border-left: 4px solid var(--accent);
		background: var(--paper-raised);
		font-style: italic;
	}

	.faq__body :global(h2) {
		margin-top: var(--space-6);
	}

	.faq__body :global(h3) {
		margin-top: var(--space-5);
		font-size: var(--text-lg);
	}

	.faq__body :global(hr) {
		border: 0;
		border-top: 1px solid var(--rule);
		margin: var(--space-5) 0;
	}

	.faq__body :global(table) {
		display: block;
		max-width: 100%;
		overflow-x: auto;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.faq__body :global(th),
	.faq__body :global(td) {
		padding: var(--space-1) var(--space-2);
		border-bottom: 1px solid var(--rule);
		text-align: left;
		vertical-align: top;
	}

	.faq__body :global(code) {
		font-size: 0.9em;
		overflow-wrap: anywhere;
	}
</style>
