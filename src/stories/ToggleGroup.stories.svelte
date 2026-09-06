<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ToggleGroup, { type ToggleOption } from '$lib/components/ui/ToggleGroup.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const type_options: ToggleOption[] = [
		{ value: 'event', label: 'Event' },
		{ value: 'hardware', label: 'Hardware' },
		{ value: 'resource', label: 'Resource' },
		{ value: 'program', label: 'Program' }
	];

	const faction_options: ToggleOption[] = [
		{ value: 'anarch', label: 'Anarch', color: 'var(--anarch)' },
		{ value: 'criminal', label: 'Criminal', color: 'var(--criminal)' },
		{ value: 'shaper', label: 'Shaper', color: 'var(--shaper)' }
	];

	const { Story } = defineMeta({
		title: 'Components/ToggleGroup',
		component: ToggleGroup,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			options: {
				control: { type: 'object' }
			},
			label: {
				control: { type: 'text' }
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['sm', 'md']
			},
			icon_only: {
				control: { type: 'boolean' }
			},
			multiple: {
				control: { type: 'boolean' }
			}
		},
		args: {
			options: type_options,
			label: 'Card type',
			size: 'md',
			icon_only: false,
			multiple: false
		}
	});
</script>

<script lang="ts">
	let selected = $state<string | null>('event');
	let default_selection = $state<string[]>(['event']);
	let colored_selected = $state<string | null>('anarch');
	let icon_selected = $state<string | null>('anarch');
	let selection = $state<string[]>(['hardware', 'program']);
</script>

<Story name="Default">
	{#snippet template(args)}
		{#if args.multiple}
			<ToggleGroup
				{...args}
				multiple
				selection={default_selection}
				ontoggle={(values) => (default_selection = values)}
			/>
		{:else}
			<ToggleGroup
				{...args}
				multiple={false}
				{selected}
				onselect={(value) => (selected = value)}
			/>
		{/if}
	{/snippet}
</Story>

<Story name="Multiple">
	{#snippet template(args)}
		<ToggleGroup {...args} multiple {selection} ontoggle={(values) => (selection = values)} />
	{/snippet}
</Story>

<Story name="Colored" args={{ label: 'Factions', options: faction_options }}>
	{#snippet template(args)}
		<ToggleGroup
			{...args}
			multiple={false}
			selected={colored_selected}
			onselect={(value) => (colored_selected = value)}
		/>
	{/snippet}
</Story>

<Story name="Icon only" args={{ label: 'Factions', options: faction_options, icon_only: true }}>
	{#snippet template(args)}
		<ToggleGroup
			{...args}
			multiple={false}
			selected={icon_selected}
			onselect={(value) => (icon_selected = value)}
		>
			{#snippet option(toggle_option: ToggleOption)}
				<Icon name={toggle_option.value} size="sm" label="" />
			{/snippet}
		</ToggleGroup>
	{/snippet}
</Story>
