<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../ui/Button.svelte';

	interface Props {
		on_change_identity: () => void;
		actions?: Snippet;
	}

	let { on_change_identity, actions }: Props = $props();
</script>

<div class="deck-bar">
	<div class="deck-bar__inner container">
		<h1>Untitled deck</h1>

		<div class="deck-bar__actions">
			<Button color="ghost" size="sm" onclick={on_change_identity}>Change identity</Button>
			{@render actions?.()}
		</div>
	</div>
</div>

<style>
	.deck-bar {
		border-bottom: 1px solid var(--border);
		background-color: var(--foreground);
	}

	.deck-bar__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1.25rem;
		padding-block: 0.75rem;
	}

	.deck-bar__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	h1 {
		margin: 0;
		font-size: var(--font-size-xl);
		line-height: var(--leading-tight);
	}
</style>
