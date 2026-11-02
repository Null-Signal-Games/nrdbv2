<script lang="ts" module>
	export interface ComboboxItem {
		id: string;
		title: string;
	}

	/**
	 * Returns the items matching `query`. The combobox will not sort results,
	 * so any sorting is up to the provider.
	 */
	export type ComboboxSearch<T extends ComboboxItem = ComboboxItem> = (
		query: string
	) => T[] | Promise<T[]>;
</script>

<script lang="ts" generics="T extends ComboboxItem">
	import { Combobox as BitsCombobox } from 'bits-ui';
	import ComboboxChip from './ComboboxChip.svelte';
	import ComboboxListbox from './ComboboxListbox.svelte';

	interface Props {
		value: T[];
		onchange: (value: T[]) => void;
		search: ComboboxSearch<T>;
		label: string;
		placeholder?: string;
		disabled?: boolean;
		max_results?: number;
	}

	let {
		value,
		onchange,
		search,
		label,
		placeholder = 'Search...',
		disabled = false,
		max_results = 10
	}: Props = $props();

	let query = $state('');
	let open = $state(false);
	let results = $state<T[]>([]);
	let field_element = $state<HTMLDivElement | null>(null);
	let input_element = $state<HTMLInputElement | null>(null);

	const has_query = $derived(query.trim().length > 0);

	const selected_ids = $derived(value.map((item) => item.id));

	const candidates = $derived(
		results.filter((item) => !selected_ids.includes(item.id)).slice(0, max_results)
	);

	const is_listbox_visible = $derived(open && has_query && candidates.length > 0 && !disabled);

	$effect(() => {
		const text = query.trim();

		if (!text) {
			results = [];
			return;
		}

		void Promise.resolve(search(text)).then((found) => (results = found));
	});

	function select_ids(ids: string[]) {
		const added = candidates.filter((item) => ids.includes(item.id));
		onchange([...value, ...added]);
		query = '';
	}

	function remove_item(item_id: string) {
		onchange(value.filter((selected) => selected.id !== item_id));
		input_element?.focus();
	}

	function handle_keydown(event: KeyboardEvent) {
		if (event.key === 'Backspace' && query === '' && value.length > 0) {
			remove_item(value[value.length - 1].id);
		}
	}
</script>

<BitsCombobox.Root
	type="multiple"
	value={selected_ids}
	onValueChange={select_ids}
	bind:open
	{disabled}
	loop
>
	<div class="combobox" class:combobox--disabled={disabled} bind:this={field_element}>
		<BitsCombobox.Input bind:ref={input_element} aria-label={label}>
			{#snippet child({ props })}
				<input
					{...props}
					class="combobox__input"
					type="text"
					autocomplete="off"
					placeholder={value.length === 0 ? placeholder : ''}
					value={query}
					oninput={(event) => {
						query = event.currentTarget.value;
						open = true;
						(props.oninput as (event: Event) => void)(event);
					}}
					onkeydown={(event) => {
						handle_keydown(event);
						(props.onkeydown as (event: KeyboardEvent) => void)(event);
					}}
					onclick={() => (open = true)}
				/>
			{/snippet}
		</BitsCombobox.Input>

		{#each value as item (item.id)}
			<ComboboxChip label={item.title} {disabled} onremove={() => remove_item(item.id)} />
		{/each}
	</div>

	{#if is_listbox_visible}
		<ComboboxListbox items={candidates} anchor={field_element} label={`${label} results`} />
	{/if}
</BitsCombobox.Root>

<style>
	.combobox {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		box-sizing: border-box;
		width: 100%;
		min-height: 2.25rem;
		padding: 0.25rem;
		background: var(--foreground);
		border: 1px solid var(--border);
	}

	.combobox:focus-within {
		border-color: var(--text);
	}

	.combobox--disabled {
		opacity: 0.5;
	}

	.combobox__input {
		order: 2;
		flex: 1 1 8rem;
		min-width: 8rem;
		padding: 0.125rem 0.25rem;
		color: var(--text);
		background: transparent;
		border: none;
		font-family: inherit;
		font-size: var(--font-size-sm);
		outline: none;
	}

	.combobox__input::placeholder {
		color: var(--text-muted);
	}
</style>
