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
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(count) as pip, index (index)}
				●
			{/each}
		</span>
		{#if total}
			<span>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each Array(5 - count) as max, index (index)}
					○
				{/each}
			</span>
		{/if}
	</span>
</span>
