<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Hint from '$lib/components/ui/Hint.svelte';
	import HintTrigger from '$lib/components/ui/HintTrigger.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const factions = [
		{ id: 'anarch', label: 'Anarch' },
		{ id: 'criminal', label: 'Criminal' },
		{ id: 'shaper', label: 'Shaper' }
	] as const;

	const { Story } = defineMeta({
		title: 'Components/Hint',
		component: Hint,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			side: {
				control: { type: 'inline-radio' },
				options: ['top', 'right', 'bottom', 'left']
			},
			side_offset: {
				control: { type: 'number' }
			},
			delay: {
				control: { type: 'number' }
			},
			children: { table: { disable: true } }
		},
		args: {
			side: 'top',
			side_offset: 4,
			delay: 0
		}
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<Hint side={args.side} side_offset={args.side_offset} delay={args.delay}>
			<div class="row">
				{#each factions as faction (faction.id)}
					<HintTrigger content={faction.label}>
						{#snippet child({ props })}
							<Button
								{...props}
								color="secondary"
								size="sm"
								aria-label={faction.label}
							>
								<Icon name={faction.id} size="sm" label="" />
							</Button>
						{/snippet}
					</HintTrigger>
				{/each}
			</div>
		</Hint>
	{/snippet}
</Story>

<style>
	.row {
		display: flex;
		gap: 0.5rem;
	}
</style>
