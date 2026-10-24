<!--
ABOUTME: The "find 10 billion" challenge above the map: how far the visitor's choices get towards the amount in the
ABOUTME: news, a button to share the budget as a link, and a note with a way back when the budget came from such a link.
-->
<script lang="ts">
	import type { Dataset } from '../data/schema.ts';
	import type { Locale } from '../i18n/locales.ts';
	import { translate, type MessageKey } from '../i18n/translate.ts';
	import { formatEuro } from '../explorer/format.ts';
	import { HEADLINE_EUR_MILLION } from '../intro/facts.ts';
	import { challengeStatus, shareTitle } from './challenge.ts';
	import { balanceChangeFrom, type Changes } from './choices.ts';
	import { encodeChoices, shareUrl } from './share.ts';

	let {
		data,
		locale,
		changes,
		revenue,
		shared,
		onrestart
	}: {
		data: Dataset;
		locale: Locale;
		changes: Changes;
		revenue: Changes;
		/** Whether the budget on screen came from a shared link. */
		shared: boolean;
		onrestart: () => void;
	} = $props();

	const t = (key: MessageKey) => translate(locale, key);
	const goal = $derived(formatEuro(HEADLINE_EUR_MILLION, locale));
	const balanceChange = $derived(balanceChangeFrom(changes, revenue));
	const encoded = $derived(encodeChoices(data, { changes, revenue }));
	const status = $derived(challengeStatus(balanceChange, encoded !== ''));
	const share = $derived(
		status.kind === 'progress' ? status.share : status.kind === 'done' ? 1 : 0
	);

	let copied = $state(false);
	$effect(() => {
		// A changed budget needs a fresh link.
		void encoded;
		copied = false;
	});

	async function shareBudget() {
		const url = shareUrl(location.origin, locale, encoded, balanceChange);
		const text = shareTitle(locale, balanceChange);
		if (typeof navigator.share === 'function') {
			try {
				await navigator.share({ title: t('site.title'), text, url });
			} catch {
				// The visitor closed the share sheet; nothing to do.
			}
			return;
		}
		await navigator.clipboard.writeText(`${text} ${url}`);
		copied = true;
	}
</script>

<section class="challenge" aria-labelledby="challenge-title">
	<div class="challenge__body">
		<h2 id="challenge-title">{t('challenge.title').replace('{goal}', goal)}</h2>
		{#if shared}
			<p class="challenge__shared">
				{t('challenge.shared')}
				<button type="button" class="link" onclick={onrestart}>{t('challenge.restart')}</button>
			</p>
		{/if}
		<div class="meter" aria-hidden="true">
			<span class="meter__fill" style="width:{(share * 100).toFixed(1)}%"></span>
		</div>
		<p class="challenge__status" class:challenge__status--worse={status.kind === 'worse'}>
			{#if status.kind === 'empty'}
				{t('challenge.lede').replace('{goal}', goal)}
				{t('challenge.empty')}
			{:else if status.kind === 'worse'}
				{t('challenge.worse').replace('{amount}', formatEuro(status.amount, locale))}
			{:else if status.kind === 'done'}
				{t('challenge.done').replace('{found}', formatEuro(status.found, locale))}
			{:else}
				{t('challenge.progress')
					.replace('{found}', formatEuro(status.found, locale))
					.replace('{goal}', goal)}
			{/if}
		</p>
	</div>
	<div class="challenge__actions">
		<button type="button" class="share" disabled={encoded === ''} onclick={shareBudget}>
			{t('challenge.share')}
		</button>
		<span class="challenge__copied" role="status">{copied ? t('challenge.copied') : ''}</span>
	</div>
</section>

<style>
	.challenge {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3) var(--space-4);
		max-width: 64rem;
		margin: var(--space-5) auto 0;
		padding: 0 var(--gutter);
	}

	.challenge__body {
		flex: 1 1 20rem;
		min-width: 0;
	}

	h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
	}

	.challenge__shared {
		margin: 0 0 var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--paper-raised);
		border-left: 3px solid var(--accent);
		font-size: var(--text-sm);
	}

	/* How much of the goal is found; the sentence below carries the numbers. */
	.meter {
		height: 0.5rem;
		background: var(--rule);
	}

	.meter__fill {
		display: block;
		height: 100%;
		background: var(--series-2);
		transition: width 0.3s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.meter__fill {
			transition: none;
		}
	}

	.challenge__status {
		margin: var(--space-2) 0 0;
		font-size: var(--text-sm);
	}

	.challenge__status--worse {
		color: var(--accent);
	}

	.challenge__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.share {
		padding: var(--space-2) var(--space-3);
		border: 0;
		background: var(--accent);
		color: var(--paper);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.share:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.challenge__copied {
		color: var(--ink-muted);
		font-size: var(--text-sm);
	}

	.link {
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
</style>
