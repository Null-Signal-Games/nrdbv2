<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../ui/Button.svelte';

	interface Props {
		name: string;
		on_change_identity: () => void;
		actions?: Snippet;
	}

	let { name = $bindable(), on_change_identity, actions }: Props = $props();
</script>

<div class="deck-bar">
	<div class="deck-bar__inner container">
		<input
			class="deck-bar__name"
			type="text"
			aria-label="Deck name"
			placeholder="Untitled deck"
			autocomplete="off"
			bind:value={name}
		/>

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
		gap: var(--space-3) var(--space-4);
		padding-block: 0.75rem;
	}

	.deck-bar__actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.deck-bar__name {
		flex: 1 1 16rem;
		box-sizing: border-box;
		margin: 0;
		margin-inline-start: -0.25rem;
		padding: 0.125rem 0.25rem;
		border: 1px solid transparent;
		border-radius: 0.25rem;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		line-height: var(--leading-tight);
	}

	.deck-bar__name:hover {
		border-color: var(--border);
	}

	.deck-bar__name:focus-visible {
		border-color: currentColor;
		outline: none;
	}

	.deck-bar__name::placeholder {
		color: var(--text-muted);
		opacity: 1;
	}
</style>
