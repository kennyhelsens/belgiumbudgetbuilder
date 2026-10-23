<!--
ABOUTME: Shell for localized pages: masthead with the site title, a work-in-progress badge, a button to watch the intro
ABOUTME: and the language switcher, and a footer that says how the figures were extracted and links to the FAQ.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { replay } from '#lib/intro/replay.svelte.ts';
	import { LOCALES } from '#lib/i18n/locales.ts';
	import { translate } from '#lib/i18n/translate.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The server sets <html lang> for the first page load; keep it in sync on client-side navigation.
	$effect(() => {
		document.documentElement.lang = data.locale;
	});

	// The intro sets out why the budget matters, so it stays one click away: from another page, go home first.
	async function watchIntro() {
		if (page.route.id !== '/[lang]') await goto(resolve('/[lang]', { lang: data.locale }));
		replay.requests += 1;
	}
</script>

<header class="masthead">
	<div class="masthead__brand">
		<a class="masthead__title" href={resolve('/[lang]', { lang: data.locale })}
			>{translate(data.locale, 'site.title')}</a
		>
		<span class="masthead__badge">{translate(data.locale, 'site.wip')}</span>
	</div>
	<button type="button" class="masthead__intro" onclick={watchIntro}>
		<span aria-hidden="true">▶</span>
		{translate(data.locale, 'intro.replay')}
	</button>
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

	.masthead__intro {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		margin-left: auto;
		padding: 0.3em 0.9em;
		border: 1.5px solid var(--ink);
		border-radius: 999px;
		background: none;
		color: var(--ink);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.masthead__intro:hover,
	.masthead__intro:focus-visible {
		background: var(--ink);
		color: var(--paper);
	}

	.masthead__intro span {
		font-size: 0.75em;
		color: var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.masthead__intro {
			transition: none;
		}
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
