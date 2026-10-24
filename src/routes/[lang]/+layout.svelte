<!--
ABOUTME: Shell for localized pages: masthead with the flag, the site title, a work-in-progress badge, the language switcher
ABOUTME: and a link to the source code; a footer on how the figures were made, and where to ask questions.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { LOCALES } from '#lib/i18n/locales.ts';
	import { translate } from '#lib/i18n/translate.ts';
	import { LINKEDIN_URL, NEW_ISSUE_URL, REPO_URL } from '#lib/site.ts';
	import Flag from '#lib/ui/Flag.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The server sets <html lang> for the first page load; keep it in sync on client-side navigation.
	$effect(() => {
		document.documentElement.lang = data.locale;
	});
</script>

<header class="masthead">
	<div class="masthead__brand">
		<a class="masthead__title" href={resolve('/[lang]', { lang: data.locale })}
			><Flag size="0.9em" /> {translate(data.locale, 'site.title')}</a
		>
		<span class="masthead__badge">{translate(data.locale, 'site.wip')}</span>
	</div>
	<div class="masthead__tools">
		<nav aria-label={translate(data.locale, 'language.switcherLabel')}>
			<ul class="switcher">
				{#each LOCALES as locale (locale)}
					<li>
						<a
							href={resolve('/[lang]', { lang: locale })}
							lang={locale}
							hreflang={locale}
							aria-current={locale === data.locale ? 'page' : undefined}
							>{translate(locale, 'language.code')}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
		<a
			class="masthead__github"
			href={REPO_URL}
			rel="external noopener"
			aria-label={translate(data.locale, 'site.github')}
			title={translate(data.locale, 'site.github')}><Icon name="github" size="1.25rem" /></a
		>
	</div>
</header>

{@render children()}

<footer class="colophon">
	<p class="colophon__disclaimer">
		{translate(data.locale, 'footer.disclaimer')}
		<a href={resolve('/[lang]/faq', { lang: data.locale })}
			>{translate(data.locale, 'footer.faq')}</a
		>
	</p>
	<p class="colophon__disclaimer">{translate(data.locale, 'footer.purpose')}</p>
	<p class="colophon__contact">
		{translate(data.locale, 'footer.contactLead')}
		<a href={NEW_ISSUE_URL} rel="external noopener"
			><Icon name="github" /> {translate(data.locale, 'footer.issue')}</a
		>
		{translate(data.locale, 'footer.or')}
		<a href={LINKEDIN_URL} rel="external noopener"
			><Icon name="linkedin" /> {translate(data.locale, 'footer.linkedin')}</a
		>.
	</p>
	<p>{translate(data.locale, 'footer.note')}</p>
</footer>

<style>
	.masthead {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		justify-content: space-between;
		align-items: baseline;
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-3) var(--gutter);
		border-bottom: 4px solid var(--ink);
	}

	.masthead__brand {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2);
	}

	.masthead__title {
		color: var(--ink);
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 900;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.masthead__badge {
		padding: 0.15em 0.6em;
		border: 1.5px solid var(--accent);
		border-radius: 999px;
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.masthead__tools {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.masthead__github {
		display: inline-flex;
		color: var(--ink-muted);
	}

	.masthead__github:hover,
	.masthead__github:focus-visible {
		color: var(--ink);
	}

	.switcher {
		display: flex;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-sm);
	}

	.switcher a {
		color: var(--ink-muted);
		text-decoration: none;
	}

	.switcher a[aria-current='page'] {
		color: var(--ink);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.colophon {
		max-width: var(--measure);
		margin: var(--space-6) auto 0;
		padding: var(--space-3) var(--gutter) var(--space-5);
		border-top: 1px solid var(--rule);
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.colophon__disclaimer {
		color: var(--ink);
	}

	.colophon a {
		color: inherit;
		font-weight: 600;
	}
</style>
