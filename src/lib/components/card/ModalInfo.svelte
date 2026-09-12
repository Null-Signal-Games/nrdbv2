<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { resolve } from '$app/paths';
	import type { Card, Printing } from '$lib/types';
	import RezCost from './RezCost.svelte';
	import { getCardModalStats } from './modal-stats';
	import FormatText from '$lib/components/FormatText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import { card_types } from '$lib/i18n';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		card: Card;
		printing: Printing | null;
	}

	let { card, printing }: Props = $props();

	const get_illustrator_credits = (printing: Printing) => {
		const { display_illustrators, illustrator_ids, illustrator_names } = printing.attributes;
		if (illustrator_names.length) {
			return illustrator_names.map((name, index) => ({
				name,
				id: illustrator_ids[index]
			}));
		}
		if (!display_illustrators) return [];

		return [
			{
				name: display_illustrators,
				id: illustrator_ids.length === 1 ? illustrator_ids[0] : undefined
			}
		];
	};

	const attributes = $derived(printing?.attributes ?? card.attributes);
	const illustrators = $derived(printing ? get_illustrator_credits(printing) : []);
	const uses_rez_cost = $derived(
		attributes.card_type_id === 'ice' ||
			attributes.card_type_id === 'asset' ||
			attributes.card_type_id === 'upgrade'
	);
	const stats = $derived(getCardModalStats(attributes));
</script>

<span class="card-modal__watermark watermark" aria-hidden="true">
	<Icon name={attributes.faction_id} size="none" class="card-modal__watermark-icon" />
</span>

<div class="card-modal__details">
	<div class="card-modal__title-row">
		{#if attributes.cost != null}
			<span class="card-modal__cost" aria-hidden="true">
				{#if uses_rez_cost}
					<RezCost class="card-modal__cost-frame" />
				{:else}
					<span class="card-modal__cost-frame card-modal__cost-frame--credit"></span>
				{/if}
				<span class="card-modal__cost-value">{attributes.cost}</span>
			</span>
			<span class="visually-hidden">Cost: {attributes.cost}</span>
		{/if}
		<Dialog.Title class="card-modal__title"
			>{attributes.is_unique ? '◆ ' : ''}{attributes.title}</Dialog.Title
		>
		{#if stats.title}
			<span class="card-modal__title-stat card-modal__stat" aria-hidden="true">
				{stats.title.value}
				{#if stats.title.icon}
					<Icon name={stats.title.icon} size="md" />
				{/if}
			</span>
			<span class="visually-hidden">{stats.title.announcement}</span>
		{/if}
	</div>

	<hr />

	<Dialog.Description class="card-modal__type">
		<strong>{card_types[attributes.card_type_id]}</strong>{attributes.display_subtypes
			? `: ${attributes.display_subtypes}`
			: ''}
	</Dialog.Description>

	{#if attributes.text || printing?.attributes.flavor}
		<hr />
		<div class="card-modal__text">
			{#if attributes.text}
				<FormatText text={attributes.text} />
			{/if}
			{#if printing && printing.attributes.flavor}
				<div class="card-modal__flavor">
					<FormatText text={printing.attributes.flavor} />
				</div>
			{/if}
		</div>
	{/if}

	<hr />

	<div class="card-modal__footer">
		<span class="card-modal__faction">
			<Icon name={attributes.faction_id} size="md" theme={attributes.faction_id} />
			{#if attributes.influence_cost}
				<Influence count={attributes.influence_cost} total={true} theme={attributes.faction_id} />
			{/if}
		</span>
		{#if stats.footer.length}
			<span class="card-modal__stats">
				{#each stats.footer as stat (stat.announcement)}
					<span class="card-modal__stat" aria-hidden="true">
						{stat.value}
						{#if stat.icon}
							<Icon name={stat.icon} size="sm" />
						{/if}
					</span>
					<span class="visually-hidden">{stat.announcement}</span>
				{/each}
			</span>
		{/if}
	</div>

	{#if printing}
		<hr />
		<p class="card-modal__credits">
			{#if illustrators.length}
				Illustrated by
				{#each illustrators as illustrator, index (illustrator.id ?? illustrator.name)}
					{#if index > 0},
					{/if}
					{#if illustrator.id}
						<a
							href={localizeHref(
								resolve('/illustrators/[slug]', { slug: illustrator.id })
							)}
						>
							{illustrator.name}
						</a>
					{:else}
						{illustrator.name}
					{/if}
				{/each}
			{/if}
			{#if illustrators.length}
				&middot;
			{/if}
			<a
				href={localizeHref(
					resolve('/sets/[slug]', { slug: printing.attributes.card_set_id })
				)}>{printing.attributes.card_set_name}</a
			>&nbsp;#{printing.attributes.position_in_set}
		</p>
	{/if}
</div>
