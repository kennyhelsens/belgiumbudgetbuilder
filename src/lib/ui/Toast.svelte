<!--
ABOUTME: A short notice at the bottom of the screen that disappears by itself after a few seconds.
ABOUTME: Announced politely to screen readers; it stays while hovered or focused, and can be closed.
-->
<script lang="ts">
	let {
		message,
		key,
		closeLabel,
		duration = 5000
	}: {
		message: string | undefined;
		/** Changes whenever a new notice is shown, so the same text shown twice restarts the timer. */
		key: number;
		closeLabel: string;
		duration?: number;
	} = $props();

	let visible = $state(false);
	let paused = $state(false);

	$effect(() => {
		void key;
		visible = message !== undefined;
	});

	$effect(() => {
		void key;
		if (!visible || paused) return;
		const timer = setTimeout(() => (visible = false), duration);
		return () => clearTimeout(timer);
	});
</script>

<div
	class="toast-region"
	role="status"
	aria-live="polite"
	onpointerenter={() => (paused = true)}
	onpointerleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	{#if visible && message}
		<div class="toast">
			<p>{message}</p>
			<button type="button" aria-label={closeLabel} onclick={() => (visible = false)}>×</button>
		</div>
	{/if}
</div>

<style>
	.toast-region {
		position: fixed;
		bottom: var(--space-4);
		left: 50%;
		z-index: 20;
		width: min(30rem, calc(100% - 2 * var(--gutter)));
		transform: translateX(-50%);
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--rule);
		border-left: 3px solid var(--accent);
		background: var(--paper-raised);
		box-shadow: 0 4px 16px color-mix(in oklab, var(--ink) 18%, transparent);
		font-size: var(--text-sm);
		animation: toast-in 0.2s ease-out;
	}

	p {
		flex: 1;
		margin: 0;
	}

	button {
		padding: 0 var(--space-1);
		border: 0;
		background: none;
		color: var(--ink-muted);
		font: inherit;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
