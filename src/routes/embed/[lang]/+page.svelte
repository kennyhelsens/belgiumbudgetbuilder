<!--
ABOUTME: The budget builder to embed in another site: key figures, the challenge, the map and the outlook, with a slim
ABOUTME: bar naming the site and a line on sources; every link opens the full site in a new tab, outside the frame.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Builder from '#lib/builder/Builder.svelte';
	import { translate } from '#lib/i18n/translate.ts';
	import Flag from '#lib/ui/Flag.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<header class="bar">
	<a
		class="bar__title"
		href={resolve('/[lang]', { lang: data.locale })}
		target="_blank"
		rel="noopener"><Flag size="0.9em" /> {t('site.title')}</a
	>
	<a
		class="bar__open"
		href={resolve('/[lang]', { lang: data.locale })}
		target="_blank"
		rel="noopener">{t('embed.open')} ↗</a
	>
</header>

<Builder data={data.dataset} locale={data.locale} />

<footer class="foot">
	<p>
		{t('footer.disclaimer')}
		<a href={resolve('/[lang]/faq', { lang: data.locale })} target="_blank" rel="noopener"
			>{t('embed.sources')} ↗</a
		>
	</p>
	<p>{t('footer.note')}</p>
</footer>

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-1) var(--space-3);
		max-width: 64rem;
		margin: 0 auto;
		padding: var(--space-2) var(--gutter);
		border-bottom: 4px solid var(--ink);
	}

	.bar__title {
		color: var(--ink);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 900;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.bar__open {
		color: var(--accent);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.foot {
		max-width: 64rem;
		margin: var(--space-5) auto 0;
		padding: var(--space-3) var(--gutter) var(--space-4);
		border-top: 1px solid var(--rule);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.foot a {
		color: inherit;
		font-weight: 600;
	}
</style>
