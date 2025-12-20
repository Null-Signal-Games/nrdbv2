<script lang="ts">
	import type { Format } from '$lib/types';
	import { formats } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let data = $derived<Format[]>($formats);
</script>

{#if data}
	<Header title="Formats" />

	<ul>
		{#each data as format (format.id)}
			<li>
				<a href={localizeHref(`/formats/${format.id}`)}>
					{format.attributes.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
