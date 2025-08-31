<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import type { Format } from '$lib/types';
	import { formats } from '$lib/store';

	let format_data: Format | undefined = $derived(
		$formats.find((format: Format) => format.id === page.params.slug)
	);
</script>

{#if format_data}
	<Header title={`Format: ${format_data.attributes.name}`} />

	<pre>{JSON.stringify(format_data, null, 2)}</pre>
{/if}
