<script lang="ts">
	import type { Card } from '$lib/types';

	interface Props {
		count: Card['attributes']['influence_cost'];
		inline?: boolean;
		text?: boolean;
		total?: boolean;
	}

	let { count, text = false, total = false }: Props = $props();
</script>

<span class="influence">
	{#if text}
		<span class="text-sm">
			{count}
		</span>
	{/if}
	<span class="influence">
		<span>
			{#each Array(count) as pip (pip)}
				●
			{/each}
		</span>
		{#if total}
			<span>
				{#each Array(5 - count) as pip (pip)}
					○
				{/each}
			</span>
		{/if}
	</span>
</span>
