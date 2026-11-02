<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Combobox, type ComboboxItem } from '$lib/components/ui/combobox';

	const items: ComboboxItem[] = [
		{ id: 'sure_gamble', title: 'Sure Gamble' },
		{ id: 'carnivore', title: 'Carnivore' },
		{ id: 'cookbook', title: 'Cookbook' },
		{ id: 'conduit', title: 'Conduit' },
		{ id: 'dzmz_optimizer', title: 'DZMZ Optimizer' },
		{ id: 'hedge_fund', title: 'Hedge Fund' },
		{ id: 'ping', title: 'Ping' }
	];

	const search_items = async (query: string) =>
		items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

	const { Story } = defineMeta({
		title: 'Components/Combobox',
		component: Combobox,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			label: {
				control: { type: 'text' }
			},
			placeholder: {
				control: { type: 'text' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		},
		args: {
			label: 'Contains cards',
			placeholder: 'Add cards...',
			disabled: false
		}
	});
</script>

<script lang="ts">
	let selection = $state<ComboboxItem[]>([]);
	let preselected = $state<ComboboxItem[]>([items[0], items[1]]);
</script>

<Story name="Default">
	{#snippet template(args)}
		<Combobox
			{...args}
			value={selection}
			onchange={(next) => (selection = next)}
			search={search_items}
		/>
	{/snippet}
</Story>

<Story name="With selection">
	{#snippet template(args)}
		<Combobox
			{...args}
			value={preselected}
			onchange={(next) => (preselected = next)}
			search={search_items}
		/>
	{/snippet}
</Story>
