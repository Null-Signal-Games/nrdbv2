<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { corp_grid_cards, runner_grid_cards } from '$lib/cards.fixture';
	import Grid from '$lib/components/decklist/Grid.svelte';
	import type { CardSlots } from '$lib/components/decklist/grid';
	import { PRECISION_DESIGN, ZAHYA } from '$lib/identities.fixture';
	import type { Card, CardGroup } from '$lib/types';

	interface GridArgs {
		readonly groups: readonly CardGroup[];
		readonly cardSlots: CardSlots;
	}

	const createCardSlots = (groups: readonly (readonly Card[])[], identity: Card): CardSlots => {
		const cardSlots: Record<string, number> = { [identity.id]: 1 };

		for (const cards of groups) {
			cards.forEach((card, index) => {
				cardSlots[card.id] = index + 1;
			});
		}

		return cardSlots;
	};

	const runner_args = {
		groups: [
			{ type: 'resource', data: [...runner_grid_cards.resource] },
			{ type: 'runner_identity', data: [ZAHYA] },
			{ type: 'program', data: [...runner_grid_cards.program] },
			{ type: 'event', data: [...runner_grid_cards.event] },
			{ type: 'hardware', data: [...runner_grid_cards.hardware] }
		],
		cardSlots: createCardSlots(Object.values(runner_grid_cards), ZAHYA)
	} satisfies GridArgs;

	const corp_args = {
		groups: [
			{ type: 'ice', data: [...corp_grid_cards.ice] },
			{ type: 'asset', data: [...corp_grid_cards.asset] },
			{ type: 'corp_identity', data: [PRECISION_DESIGN] },
			{ type: 'upgrade', data: [...corp_grid_cards.upgrade] },
			{ type: 'agenda', data: [...corp_grid_cards.agenda] },
			{ type: 'operation', data: [...corp_grid_cards.operation] }
		],
		cardSlots: createCardSlots(Object.values(corp_grid_cards), PRECISION_DESIGN)
	} satisfies GridArgs;

	const { Story } = defineMeta({
		title: 'Components/Decklist/Grid',
		component: Grid,
		tags: ['autodocs'],
		render: template,
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			groups: { control: { type: 'object' } },
			cardSlots: { control: { type: 'object' } }
		},
		args: runner_args
	});
</script>

{#snippet template(args: GridArgs)}
	<div class="preview">
		<Grid groups={args.groups} cardSlots={args.cardSlots} />
	</div>
{/snippet}

<Story name="Runner" />
<Story name="Corp" args={corp_args} />

<style>
	.preview {
		box-sizing: border-box;
		width: min(60rem, calc(100vw - 2rem));
		padding: 1rem;
	}
</style>
