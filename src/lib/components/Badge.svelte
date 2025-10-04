<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		icon?: Snippet;
	}

	let { children, icon }: Props = $props();
</script>

<span class="badge">
	{@render icon?.()}
	{@render children?.()}
</span>

<style>
	/* Temporary styles */
	.badge {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		border: #fff solid 1px;
	}
</style>
