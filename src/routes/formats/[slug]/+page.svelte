<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import type { Format } from '$lib/types';
	import { formats } from '$lib/store';
	import { find_or_server } from '$lib/utils';

	interface Props {
		data: { format: Format | null };
	}

	let { data }: Props = $props();

	let format_data = $derived<Format | undefined>(
		find_or_server(
			$formats,
			(f) => f.id === page.params.slug,
			data.format,
			`format:${page.params.slug}`
		)
	);
</script>

{#if format_data}
	<Header title={`Format: ${format_data.attributes.name}`} />

	<pre>{JSON.stringify(format_data, null, 2)}</pre>
{/if}
