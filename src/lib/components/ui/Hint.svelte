<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Tooltip } from 'bits-ui';

	interface Props {
		children: Snippet;
		side?: 'top' | 'right' | 'bottom' | 'left';
		side_offset?: number;
		delay?: number;
	}

	let { children: triggers, side = 'top', side_offset = 4, delay = 0 }: Props = $props();
</script>

<Tooltip.Provider delayDuration={delay}>
	<Tooltip.Root disableHoverableContent>
		{#snippet children({ payload })}
			{@render triggers()}
			<Tooltip.Portal>
				<Tooltip.Content class="hint" {side} sideOffset={side_offset}>
					{payload}
				</Tooltip.Content>
			</Tooltip.Portal>
		{/snippet}
	</Tooltip.Root>
</Tooltip.Provider>

<style>
	:global(.hint) {
		z-index: 20;
		padding: 0.25rem 0.5rem;
		font-size: var(--font-size-sm);
		line-height: var(--leading-tight);
		color: var(--text);
		background: var(--foreground);
		border: 1px solid var(--border);
	}
</style>
