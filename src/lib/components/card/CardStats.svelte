<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import { factions } from '$lib/i18n';
	import { localizeHref } from '$lib/paraglide/runtime';
	import CardStat from './CardStat.svelte';
	import { getCardModalStats, type CardModalAttributes } from './modal-stats';

	interface Props {
		attributes: CardModalAttributes;
		spread?: boolean;
		link_faction?: boolean;
	}

	let { attributes, spread = false, link_faction = false }: Props = $props();

	const stats = $derived(getCardModalStats(attributes).footer);
	const faction_name = $derived(factions[attributes.faction_id]);
</script>

<div class="card-stats" class:card-stats--spread={spread}>
	<span class="card-stats__faction">
		{#if link_faction}
			<a href={localizeHref(`/faction/${attributes.faction_id}`)} title={faction_name}>
				<Icon
					name={attributes.faction_id}
					theme={attributes.faction_id}
					label={faction_name}
				/>
			</a>
		{:else}
			<Icon name={attributes.faction_id} theme={attributes.faction_id} label={faction_name} />
		{/if}
		{#if attributes.influence_cost}
			<Influence
				count={attributes.influence_cost}
				total={true}
				theme={attributes.faction_id}
			/>
		{/if}
	</span>
	{#if stats.length}
		<span class="card-stats__values">
			{#each stats as stat (stat.announcement)}
				<CardStat {stat} />
			{/each}
		</span>
	{/if}
</div>

<style>
	.card-stats {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}

	.card-stats--spread {
		justify-content: space-between;
	}

	.card-stats__faction {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card-stats__faction a {
		display: inline-flex;
	}

	.card-stats__values {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
	}
</style>
