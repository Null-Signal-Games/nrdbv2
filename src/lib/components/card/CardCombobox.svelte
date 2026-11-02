<script lang="ts">
	import { Combobox, type ComboboxItem, type ComboboxSearch } from '$lib/components/ui/combobox';
	import { searchCards } from '$lib/search';
	import { rankCards } from '$lib/search/filter';
	import { db_ready } from '$lib/store';

	interface Props {
		value: ComboboxItem[];
		onchange: (value: ComboboxItem[]) => void;
		label: string;
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		value,
		onchange,
		label,
		placeholder = 'Add cards...',
		disabled = false
	}: Props = $props();

	const search: ComboboxSearch = async (query) => {
		const { cards } = await searchCards(query);
		return rankCards(cards, query).map((card) => ({
			id: card.id,
			title: card.attributes.title
		}));
	};
</script>

<Combobox
	{value}
	{onchange}
	{search}
	{label}
	placeholder={$db_ready ? placeholder : 'Loading cards...'}
	disabled={disabled || !$db_ready}
/>
