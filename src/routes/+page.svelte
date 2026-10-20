<!--
ABOUTME: Language choice page at the site root, shown in all three languages at once.
ABOUTME: Belgium is multilingual, so the visitor picks rather than being redirected.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { LOCALES } from '#lib/i18n/locales.ts';
	import { translate } from '#lib/i18n/translate.ts';
</script>

<svelte:head>
	<title>{LOCALES.map((locale) => translate(locale, 'site.title')).join(' · ')}</title>
</svelte:head>

<main class="choice">
	{#each LOCALES as locale (locale)}
		<a
			class="choice__option"
			href={resolve('/[lang]', { lang: locale })}
			lang={locale}
			hreflang={locale}
		>
			<span class="choice__title">{translate(locale, 'site.title')}</span>
			<span class="choice__language">{translate(locale, 'language.name')}</span>
		</a>
	{/each}
</main>

<style>
	.choice {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-6) var(--gutter);
		display: grid;
		gap: var(--space-4);
		min-height: 100vh;
		align-content: center;
	}

	.choice__option {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4) 0;
		border-top: 1px solid var(--rule);
		color: var(--ink);
		text-decoration: none;
	}

	.choice__option:last-child {
		border-bottom: 1px solid var(--rule);
	}

	.choice__title {
		font-size: var(--text-sm);
		color: var(--ink-muted);
	}

	.choice__language {
		font-size: var(--text-xl);
		color: var(--accent);
	}

	.choice__option:hover .choice__language,
	.choice__option:focus-visible .choice__language {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>
