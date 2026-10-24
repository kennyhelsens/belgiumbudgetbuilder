<!--
ABOUTME: The page for press and teachers: what the site is, the code to embed the builder with a copy button, the
ABOUTME: preview images in each language, how to cite the site, and how to reach its maker.
-->
<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { LOCALES } from '#lib/i18n/locales.ts';
	import { translate } from '#lib/i18n/translate.ts';
	import { embedCode } from '#lib/share/embed.ts';
	import { LINKEDIN_URL, NEW_ISSUE_URL, SITE_URL } from '#lib/site.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived((key: Parameters<typeof translate>[1]) => translate(data.locale, key));
	const code = $derived(embedCode(SITE_URL, data.locale));

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(code);
		copied = true;
	}
</script>

<svelte:head>
	<title>{t('press.title')} · {t('site.title')}</title>
	<meta name="description" content={t('press.lede')} />
</svelte:head>

<main class="press">
	<h1>{t('press.title')}</h1>
	<p class="press__lede">{t('press.lede')}</p>

	<section aria-labelledby="press-embed">
		<h2 id="press-embed">{t('press.embedTitle')}</h2>
		<p>{t('press.embedText')}</p>
		<textarea class="press__code" readonly rows="4" aria-label={t('press.embedCode')}
			>{code}</textarea
		>
		<p class="press__actions">
			<button type="button" class="press__copy" onclick={copy}>{t('press.copy')}</button>
			<span role="status">{copied ? t('press.copied') : ''}</span>
			<a href={resolve('/embed/[lang]', { lang: data.locale })} target="_blank" rel="noopener"
				>{t('press.embedPreview')} ↗</a
			>
		</p>
	</section>

	<section aria-labelledby="press-images">
		<h2 id="press-images">{t('press.imagesTitle')}</h2>
		<p>{t('press.imagesText')}</p>
		<ul class="press__images">
			{#each LOCALES as locale (locale)}
				<li>
					<a href={asset(`og/${locale}.png`)} download="belgiumbudgetbuilder-{locale}.png">
						<img src={asset(`og/${locale}.png`)} alt="" width="1200" height="630" loading="lazy" />
						{translate(locale, 'language.name')}
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="press-cite">
		<h2 id="press-cite">{t('press.citeTitle')}</h2>
		<blockquote class="press__cite">{t('press.cite')}</blockquote>
		<p>{t('press.citeNote')}</p>
		<p>
			<a href={resolve('/[lang]/faq', { lang: data.locale })}>{t('footer.faq')}</a>
		</p>
	</section>

	<section aria-labelledby="press-contact">
		<h2 id="press-contact">{t('press.contactTitle')}</h2>
		<p>
			{t('press.contactText')}
			<a href={NEW_ISSUE_URL} rel="external noopener"><Icon name="github" /> {t('footer.issue')}</a>
			{t('footer.or')}
			<a href={LINKEDIN_URL} rel="external noopener"
				><Icon name="linkedin" /> {t('footer.linkedin')}</a
			>.
		</p>
	</section>
</main>

<style>
	.press {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-5) var(--gutter) 0;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 3rem);
		font-weight: 900;
		letter-spacing: -0.025em;
	}

	.press__lede {
		font-size: var(--text-lg);
	}

	h2 {
		margin-top: var(--space-5);
		font-size: var(--text-xl);
	}

	.press__code {
		box-sizing: border-box;
		width: 100%;
		padding: var(--space-2);
		border: 1px solid var(--rule);
		background: var(--paper-raised);
		color: var(--ink);
		font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
		font-size: 0.8125rem;
		resize: vertical;
	}

	.press__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
	}

	.press__copy {
		padding: var(--space-2) var(--space-3);
		border: 0;
		background: var(--accent);
		color: var(--paper);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.press__images {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-sm);
	}

	.press__images img {
		display: block;
		width: 100%;
		height: auto;
		margin-bottom: var(--space-1);
		border: 1px solid var(--rule);
	}

	.press__cite {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border-left: 3px solid var(--accent);
		background: var(--paper-raised);
		font-style: italic;
	}

	.press a {
		color: var(--accent);
	}
</style>
