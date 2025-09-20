<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import type { Card } from '$lib/types';
	import Icon from './Icon.svelte';
	import { tooltip } from '$lib/actions';
	import { factions } from '$lib/i18n';
	import type { FactionIds } from '$lib/types';

	interface Props {
		data: Card[];
	}

	const { data }: Props = $props();
</script>

<table>
	<thead>
		<tr>
			<th>{m.name()}</th>
			<th>{m.influence()}</th>
			<th>{m.faction()}</th>
			<th>{m.type()}</th>
			<th>{m.subtype()}</th>
			<th>{m.cost()}</th>
			<th>{m.trash()}</th>
			<th>{m.strength()}</th>
		</tr>.
	</thead>
	<tbody>
		{#each data as card (card.id)}
			<tr>
				<td>
					<a href="/cards/{card.id}" use:tooltip={card}>
						{card.attributes.title}
					</a>
				</td>
				<td>
					{#if card.attributes.influence_cost}
						{card.attributes.influence_cost}
					{/if}
				</td>
				<td>
					<span data-faction-theme={card.attributes.faction_id}>
						<Icon name={card.attributes.faction_id} size="sm" />
					</span>
					{factions[card.attributes.faction_id as FactionIds]?.()}
				</td>
				<td>
					<Icon name={card.attributes.card_type_id} size="sm" />
					{m[card.attributes.card_type_id]()}
				</td>
				<td>
					{card.attributes.display_subtypes}
				</td>
				<td>
					{#if card.attributes.cost}
						{card.attributes.cost}
						<Icon name="credit" size="sm" />
					{/if}
				</td>
				<td>
					{#if card.attributes.trash_cost}
						{card.attributes.trash_cost}
						<Icon name="trash" size="sm" />
					{/if}
				</td>
				<td>
					{#if card.attributes.strength}
						{card.attributes.strength}
						<Icon name="strength" size="sm" />
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
