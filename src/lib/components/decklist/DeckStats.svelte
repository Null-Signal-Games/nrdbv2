<script lang="ts">
	import type { DeckStats } from './deck_stats';

	interface Props {
		readonly stats: DeckStats;
	}

	let { stats }: Props = $props();

	const cards_short = $derived(
		stats.minimum_deck_size !== null && stats.card_count < stats.minimum_deck_size
	);
	const influence_over = $derived(
		stats.influence_limit !== null && stats.influence_spent > stats.influence_limit
	);
	const agendas_off = $derived(
		stats.agenda_point_range !== null &&
			(stats.agenda_points < stats.agenda_point_range.min ||
				stats.agenda_points > stats.agenda_point_range.max)
	);
</script>

{#snippet limit(text: string)}
	<span class="deck-stats__limit">{' / '}{text}</span>
{/snippet}

<dl class="deck-stats" aria-label="Deck summary">
	<div class="deck-stats__item" data-invalid={cards_short || undefined}>
		<dt>Cards</dt>
		<dd>
			{stats.card_count}
			{#if stats.minimum_deck_size !== null}
				{@render limit(`${stats.minimum_deck_size} min`)}
			{/if}
		</dd>
	</div>

	<div class="deck-stats__item" data-invalid={influence_over || undefined}>
		<dt>Influence</dt>
		<dd>
			{stats.influence_spent}
			{@render limit(`${stats.influence_limit ?? '∞'}`)}
		</dd>
	</div>

	{#if stats.agenda_point_range}
		<div class="deck-stats__item" data-invalid={agendas_off || undefined}>
			<dt>Agenda points</dt>
			<dd>
				{stats.agenda_points}
				{@render limit(`${stats.agenda_point_range.min}–${stats.agenda_point_range.max}`)}
			</dd>
		</div>
	{/if}
</dl>

<style>
	.deck-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-6);
		margin: 0;
	}

	.deck-stats__item {
		display: grid;
		gap: 0.125rem;
	}

	.deck-stats dt {
		color: var(--text-muted);
		font-size: var(--font-size-sm);
	}

	.deck-stats dd {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.deck-stats__limit {
		color: var(--text-muted);
		font-weight: var(--font-weight-normal);
	}

	.deck-stats__item[data-invalid] dd {
		color: light-dark(#b3261e, #ff8a80);
	}
</style>
