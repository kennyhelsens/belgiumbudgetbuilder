<!--
ABOUTME: Emoji bubbles that rise from the bottom of the screen and fade, one burst per change.
ABOUTME: Decorative only: hidden from screen readers, and not shown to people who prefer reduced motion.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { bubblesFor, type Bubble, type Mood } from './bubbles.ts';

	let { burst }: { burst: { mood: Mood; key: number } | undefined } = $props();

	let shown: { key: number; mood: Mood; bubbles: Bubble[] }[] = $state([]);
	const reducedMotion = () =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	$effect(() => {
		if (!burst || reducedMotion()) return;
		const { key, mood } = burst;
		if (untrack(() => shown.some((b) => b.key === key))) return;
		// Each burst removes itself; reading the list untracked keeps earlier bursts from restarting.
		untrack(() => (shown = [...shown, { key, mood, bubbles: bubblesFor(mood, Math.random) }]));
		setTimeout(() => (shown = shown.filter((b) => b.key !== key)), 3200);
	});
</script>

<div class="bubbles" aria-hidden="true">
	{#each shown as group (group.key)}
		{#each group.bubbles as bubble, i (i)}
			<span
				class="bubble"
				data-testid="bubble"
				data-mood={group.mood}
				style="left: {bubble.left}%; font-size: {bubble.size}rem; animation-delay: {bubble.delay}s; animation-duration: {bubble.duration}s"
				>{bubble.emoji}</span
			>
		{/each}
	{/each}
</div>

<style>
	.bubbles {
		position: fixed;
		inset: 0;
		z-index: 30;
		overflow: hidden;
		pointer-events: none;
	}

	.bubble {
		position: absolute;
		bottom: -3rem;
		opacity: 0;
		animation-name: rise;
		animation-timing-function: ease-out;
		animation-fill-mode: forwards;
	}

	@keyframes rise {
		0% {
			opacity: 0;
			transform: translateY(0) scale(0.6);
		}
		15% {
			opacity: 1;
			transform: translateY(-15vh) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(-100vh) scale(1.1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bubbles {
			display: none;
		}
	}
</style>
