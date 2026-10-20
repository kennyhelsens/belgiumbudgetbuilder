<!--
ABOUTME: Root layout: loads the serif font, the design tokens and global styles, and the favicon.
ABOUTME: Shared by the language choice page and all localized pages.
-->
<script lang="ts">
	import '@fontsource-variable/newsreader';
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
