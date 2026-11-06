<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		label: string;
		onremove: () => void;
		disabled?: boolean;
	}

	let { label, onremove, disabled = false }: Props = $props();
</script>

<span class="chip">
	<span class="chip__label">{label}</span>
	<button
		type="button"
		class="chip__remove"
		aria-label={`Remove ${label}`}
		{disabled}
		onclick={onremove}
	>
		<XIcon size={12} />
	</button>
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		max-width: 100%;
		padding: 0.125rem 0.125rem 0.125rem 0.375rem;
		background: var(--background);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: var(--font-size-sm);
	}

	.chip__label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chip__remove {
		display: grid;
		place-items: center;
		padding: 0.125rem;
		color: var(--text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.chip__remove:hover {
		color: var(--text);
	}

	.chip__remove:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 1px;
	}
</style>
