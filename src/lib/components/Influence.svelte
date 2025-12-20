<script lang="ts">
	import type { Card, FactionIds } from '$lib/types';

	interface Props {
		count: Card['attributes']['influence_cost'];
		inline?: boolean;
		text?: boolean;
		total?: boolean;
		theme?: FactionIds;
	}

	let { count, text = false, total = false, theme }: Props = $props();
</script>

<span class="influence" style={theme ? `--color: var(--${theme})` : ''}>
	{#if text}
		<span>
			{count}
		</span>
	{/if}
	<span class="influence__pips">
		<span class="influence__pips__filled">
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(count) as pip, index (index)}
				●
			{/each}
		</span>
		{#if total}
			<span class="influence__pips__empty">
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each Array(5 - count) as max, index (index)}
					○
				{/each}
			</span>
		{/if}
	</span>
</span>

<style>
	.influence {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 1rem;
	}

	.influence__pips {
		display: flex;
		flex-direction: row;
	}

	.influence__pips__filled {
		color: var(--color, inherit);
	}

	.influence__pips__empty {
		color: inherit;
		opacity: 0.3;
	}

	@media (prefers-contrast: more) {
		.influence__pips__filled {
			color: inherit;
		}

		.influence__pips__empty {
			opacity: 1;
		}
	}
</style>
