<!--
ABOUTME: The Belgian flag as a small inline drawing: black, yellow and red, upright, with rounded corners.
ABOUTME: Drawn rather than an emoji, because some systems (Windows) show flag emoji as the letters "BE".
-->
<script lang="ts">
	let { size = '1em' }: { size?: string } = $props();
</script>

<svg
	class="flag"
	data-testid="flag"
	viewBox="0 0 15 13"
	width={size}
	aria-hidden="true"
	focusable="false"
>
	<rect width="5" height="13" fill="#1a1a1a" />
	<rect x="5" width="5" height="13" fill="#fdda24" />
	<rect x="10" width="5" height="13" fill="#ef3340" />
</svg>

<style>
	.flag {
		display: inline-block;
		flex: none;
		height: auto;
		overflow: hidden;
		border-radius: 0.12em;
		vertical-align: -0.1em;
	}
</style>
