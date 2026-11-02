<script lang="ts" generics="T extends ComboboxItem">
	import { Combobox as BitsCombobox } from 'bits-ui';
	import type { ComboboxItem } from './Combobox.svelte';

	interface Props {
		items: T[];
		anchor: HTMLElement | null;
		label: string;
	}

	let { items, anchor, label }: Props = $props();
</script>

<BitsCombobox.Portal>
	<BitsCombobox.Content
		class="combobox__listbox"
		customAnchor={anchor}
		sideOffset={2}
		aria-label={label}
	>
		<BitsCombobox.Viewport>
			{#each items as item (item.id)}
				<BitsCombobox.Item class="combobox__option" value={item.id} label={item.title}>
					{item.title}
				</BitsCombobox.Item>
			{/each}
		</BitsCombobox.Viewport>
	</BitsCombobox.Content>
</BitsCombobox.Portal>

<style>
	:global(.combobox__listbox) {
		z-index: 50;
		box-sizing: border-box;
		width: var(--bits-combobox-anchor-width);
		max-height: min(15rem, var(--bits-combobox-content-available-height));
		background: var(--foreground);
		border: 1px solid var(--border);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
	}

	:global(.combobox__option) {
		padding: 0.375rem 0.5rem;
		color: var(--text);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	:global(.combobox__option[data-highlighted]) {
		background: var(--text);
		color: var(--background);
	}
</style>
