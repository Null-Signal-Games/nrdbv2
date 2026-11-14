<script lang="ts">
	import type { PageServerData, PageData } from './$types';
	import { NRDB_API_URL } from '$lib/constants';
	import Meta from '$lib/components/Meta.svelte';
	import CardMeta from '$lib/components/card/Meta.svelte';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import CardCost from '$lib/components/card/CardCost.svelte';
	import CardStat from '$lib/components/card/CardStat.svelte';
	import CardStats from '$lib/components/card/CardStats.svelte';
	import { getCardModalStats } from '$lib/components/card/modal-stats';
	import Review from '$lib/components/review/Item.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { card_types, card_sub_types } from '$lib/i18n';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { createHref } from '$lib/decklist_params';
	import { getHighResImage } from '$lib/utils';
	import FormatText from '$lib/components/FormatText.svelte';
	import Container from '$lib/components/Container.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { next, previous } from '$lib/paraglide/messages';
	import Ghost from '$lib/components/Ghost.svelte';
	import RulingItem from '$lib/components/Ruling.svelte';
	import HeaderImage from '$lib/components/HeaderImage.svelte';

	interface Props {
		data: PageServerData & PageData;
	}

	let { data }: Props = $props();

	const agenda_stat = $derived(getCardModalStats(data.card.attributes).title);

	const subtypes = $derived(
		data.card.attributes.card_subtype_ids.map((subtype) => card_sub_types[subtype]).join(', ')
	);
</script>

<Meta title={data.card.attributes.title}>
	{#if data?.card_prev}
		<link
			rel="preload"
			href={getHighResImage(data.card_prev)}
			as="image"
			fetchpriority="high"
		/>
	{/if}

	{#if data?.card_next}
		<link
			rel="preload"
			href={getHighResImage(data.card_next)}
			as="image"
			fetchpriority="high"
		/>
	{/if}
</Meta>

<Container>
	<div
		class="card-page"
		style="--faction: var(--{data.card.attributes.faction_id}); --faction-contrast: var(--{data
			.card.attributes.faction_id}-contrast)"
	>
		<aside class="rail">
			<div class="cover">
				<CardImage card={data.card} hasTransition={true} href={null} />
			</div>

			<div class="actions">
				<Button href={localizeHref(`/decklists/search?cards[]=${data.card.id}`)}>
					<Icon name="subroutine" size="sm" />
					<!-- TODO(i18n) -->
					Decklists with this card
				</Button>
				{#if data.card.attributes.card_type_id.includes('_identity')}
					<Button
						href={localizeHref(createHref({ identity: data.card.id }))}
						color="secondary"
					>
						Create deck with this identity
					</Button>
				{/if}
				<Button
					href={`${NRDB_API_URL}/cards/${data.card.id}`}
					target="_blank"
					color="secondary"
				>
					<Icon name="subroutine" size="sm" />
					<!-- TODO(i18n) -->
					View on NetrunnerDB
				</Button>
			</div>
		</aside>

		<div class="main">
			<div class="info">
				<div class="info-head">
					<div class="title-row">
						{#if data.card.attributes.cost !== null}
							<CardCost
								cost={data.card.attributes.cost}
								type={data.card.attributes.card_type_id}
							/>
						{/if}
						<h1 class="title">
							{data.card.attributes.is_unique ? '◆ ' : ''}{data.card.attributes.title}
						</h1>

						{#if data.card_prev}
							<Button href={localizeHref(`/card/${data.card_prev.id}`)}>
								{previous()}
							</Button>
						{/if}
						{#if data.card_next}
							<Button href={localizeHref(`/card/${data.card_next.id}`)}>
								{next()}
							</Button>
						{/if}
					</div>

					<hr />

					<div class="type-row">
						<p class="type">
							<strong>{card_types[data.card.attributes.card_type_id]}</strong
							>{subtypes ? `: ${subtypes}` : ''}
						</p>
						<div class="stats-row">
							<CardStats attributes={data.card.attributes} link_faction />
							{#if agenda_stat}
								<CardStat stat={agenda_stat} />
							{/if}
						</div>
					</div>
				</div>

				<div class="info-body">
					<hr />

					{#if data.card.attributes.text}
						<div class="card-text">
							<FormatText text={data.card.attributes.text} />
						</div>
					{/if}

					{#if data.printings[0]?.attributes.flavor}
						<p class="flavor">{data.printings[0].attributes.flavor}</p>
					{/if}
				</div>
			</div>

			{#if data.printings.length > 0 && data.printings[0].attributes.illustrator_ids.length > 0}
				<p>
					<a
						href={localizeHref(
							`/illustrators/${data.printings[0].attributes.illustrator_ids[0]}`
						)}
						class="underline"
					>
						Illustrated by {data.printings[0].attributes.display_illustrators}
					</a>
				</p>
			{/if}

			<div>
				<div>
					<p>Cycle</p>
					{#each data.card.attributes.card_cycle_ids as cycle_id, index}
						<a href={localizeHref(`/cycles/${cycle_id}`)} class="underline">
							{data.card.attributes.card_cycle_names[index]}
						</a>
					{/each}
				</div>
				<hr />
				<div>
					<p>sets</p>
					{#each data.card.attributes.card_set_ids as set_id, index}
						<a href={localizeHref(`/sets/${set_id}`)} class="underline">
							{data.card.attributes.card_set_names[index]}
						</a>
					{/each}
				</div>
				<hr />
				<div>
					<p>legality</p>
				</div>
			</div>

			<div style="display: grid; gap: 1rem;">
				<!-- PRINTINGS/ALTERNATIVE-ARTS -->
				{#if data.printings.length > 1}
					<div class="box">
						<!-- TODO(i18n) -->
						<h2>Prints &amp; Alternative Arts</h2>
						<div>
							<div
								style="display: grid; grid-template-columns: repeat(5, minmax(auto, 1fr)); gap: 1rem;"
							>
								{#each data.printings as printing (printing.id)}
									<CardMeta card={printing} title={false}>
										<CardImage card={printing} href={null} />
										<!-- <pre>{JSON.stringify(printing, null, 2)}</pre> -->
										{#snippet content()}
											Illusrated by <a
												href={localizeHref(
													`/illustrators/${printing.attributes.illustrator_ids[0]}`
												)}>{printing.attributes.display_illustrators}</a
											>
										{/snippet}
									</CardMeta>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- RULINGS -->
				{#await data.rulings}
					<Ghost />
				{:then rulings}
					<!-- <pre>{JSON.stringify(rulings, null, 2)}</pre> -->
					<div class="box rulings">
						<!-- TODO: i18n value for header -->
						<h2>Rulings</h2>
						{#if rulings.length > 0}
							<ul>
								{#each rulings as ruling (ruling.id)}
									<RulingItem data={ruling} />
								{/each}
							</ul>
						{:else}
							<p>No rulings found for this card.</p>
						{/if}
					</div>
				{:catch error}
					<p>error loading rulings: {error.message}</p>
				{/await}

				<!-- REVIEWS -->
				{#await data.reviews}
					Loading reviews...
				{:then reviews}
					<div class="box reviews">
						<h2>Reviews</h2>
						{#each reviews as review (review.id)}
							<Review {review} />
						{/each}
					</div>
				{:catch error}
					<p>error loading comments: {error.message}</p>
				{/await}

				<!-- <pre>{JSON.stringify(data.card, null, 2)}</pre>
    
            prev:
            <pre>{JSON.stringify(data.card_prev, null, 2)}</pre>
            next:
            <pre>{JSON.stringify(data.card_next, null, 2)}</pre> -->
			</div>
		</div>
	</div>
</Container>

<HeaderImage card={data.card} />

<style>
	/* Temporary styles */
	.card-page {
		display: grid;
		grid-template-columns: 340px minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
		padding-block: 1.5rem 3rem;
	}

	.rail {
		position: sticky;
		top: 1.5rem;
		display: grid;
		gap: 1rem;
	}

	.actions {
		display: grid;
		gap: 0.5rem;
	}

	.actions :global(.button) {
		width: 100%;
	}

	.main {
		display: grid;
		gap: 1rem;
		min-width: 0;
	}

	.info-head,
	.info-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background-color: var(--foreground);
		border: 1px solid var(--border);
	}

	.info-head {
		padding: 1.5rem 1.5rem 0;
		border-bottom: none;
	}

	.info-body {
		padding: 0.75rem 1.5rem 1.5rem;
		border-top: none;
		box-shadow: 0 6px 12px -6px rgb(0 0 0 / 0.12);
	}

	.info hr {
		width: 100%;
		margin: 0;
		border: none;
		border-top: 1px solid var(--border);
	}

	.title-row {
		--card-cost-size: 2.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.title {
		flex: 1 1 auto;
		min-width: 0;
		margin: 0;
		font-size: var(--font-size-3xl);
		overflow-wrap: anywhere;
	}

	.type {
		margin: 0;
	}

	.card-text {
		font-size: var(--font-size-lg);
		line-height: 1.55;
	}

	.card-text :global(.formatted-text) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card-text :global(p) {
		margin: 0;
	}

	.flavor {
		margin: 0;
		font-style: italic;
		color: var(--text-muted);
	}

	.type-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.stats-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}

	.reviews {
		display: grid;
		gap: 1rem;
	}

	.box {
		padding: 2rem;
		border-radius: 0.5rem;
		background-color: var(--foreground);
	}

	@media (max-width: 900px) {
		.card-page {
			grid-template-columns: minmax(0, 1fr);
		}

		.rail {
			position: static;
		}

		.cover :global(img.card) {
			width: min(62%, 300px);
			margin-inline: auto;
		}
	}
	@media (max-width: 640px) {
		.info-head {
			padding: 1.25rem 1.25rem 0;
		}

		.info-body {
			padding: 0.75rem 1.25rem 1.25rem;
		}

		.title {
			font-size: var(--font-size-2xl);
		}
	}
</style>
