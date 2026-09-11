<script lang="ts">
	import type { Snippet } from 'svelte';
	import CardModalHost from '$lib/components/card/CardModalHost.svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<CardModalHost />
{@render children?.()}
