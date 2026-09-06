<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		theme?: 'auto' | 'light' | 'dark';
		children?: Snippet;
	}

	let { theme = 'auto', children }: Props = $props();
</script>

<div class="surface" style:color-scheme={theme === 'auto' ? null : theme}>
	{@render children?.()}
</div>

<style>
	.surface {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		background-color: var(--background);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: var(--font-size-base);
		line-height: var(--leading-body);
	}
</style>
