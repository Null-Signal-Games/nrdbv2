<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DeckHeader from '$lib/components/decklist/DeckHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Dropdown, DropdownItem } from '$lib/components/ui/dropdown';
	import { PRECISION_DESIGN, ZAHYA } from '$lib/identities.fixture';
	import type { Card } from '$lib/types';

	interface DeckHeaderArgs {
		identity: Card;
		name: string;
	}

	const { Story } = defineMeta({
		title: 'Components/Decklist/Header',
		component: DeckHeader,
		tags: ['autodocs'],
		render: template,
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			identity: { control: { type: 'object' } }
		},
		args: {
			identity: ZAHYA,
			name: 'Tickets, please'
		}
	});
</script>

{#snippet template(args: DeckHeaderArgs)}
	<div class="preview">
		<DeckHeader identity={args.identity} name={args.name}>
			<p class="byline">by Null Signal Games &middot; May 3, 2025</p>

			{#snippet actions()}
				<Button color="secondary" size="sm">Copy link</Button>
				<Dropdown label="Export" color="secondary" size="sm">
					<DropdownItem onSelect={() => {}}>Download Markdown</DropdownItem>
					<DropdownItem onSelect={() => {}}>Download JSON</DropdownItem>
				</Dropdown>
			{/snippet}
		</DeckHeader>
	</div>
{/snippet}

<Story name="Runner" />
<Story name="Corp" args={{ identity: PRECISION_DESIGN, name: 'Brutal Efficiency' }} />

<style>
	.preview {
		box-sizing: border-box;
		width: min(64rem, calc(100vw - 2rem));
		padding: 1rem;
	}

	.byline {
		margin: 0;
		color: var(--text-muted);
	}
</style>
