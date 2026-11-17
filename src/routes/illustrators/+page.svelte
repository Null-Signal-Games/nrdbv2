<script lang="ts">
	import type { PageServerData, PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Container from '$lib/components/Container.svelte';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import Meta from '$lib/components/Meta.svelte';

	interface Props {
		data: PageServerData & PageData;
	}

	let { data }: Props = $props();
</script>

<Meta title="Illustrators" />

<Header title="Illustrators" />

<Container>
	<div class="illustrators">
		{#each data.illustrators as illustrator (illustrator.id)}
			{@const illustratorPrintings = data.illustrator_printings?.[illustrator.id] ?? []}

			<article class="illustrator-card">
				<a
					class="illustrator-card__heading"
					href={localizeHref(`/illustrators/${illustrator.id}`)}
				>
					<h2>{illustrator.attributes.name}</h2>
					<p>{illustrator.attributes.num_printings} cards</p>
				</a>

				<div class="illustrator-card__printings">
					{#each illustratorPrintings.slice(0, 3) as printing, index (printing.id)}
						<div>
							<CardImage card={printing} loading="lazy" />
						</div>
					{/each}
				</div>
			</article>
		{/each}
	</div>
</Container>

<style>
	.illustrators {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(3, 1fr);
	}

	.illustrator-card {
		display: grid;
		gap: var(--space-4);
		padding: 1rem;
		border: 1px solid var(--border);
		background: var(--foreground);
		border-radius: 0.75rem;
	}

	.illustrator-card__heading {
		display: grid;
		gap: var(--space-1);
		color: inherit;
		text-decoration: none;
	}

	.illustrator-card__heading h2,
	.illustrator-card__heading p {
		margin: 0;
	}

	.illustrator-card__heading p {
		color: var(--text-muted);
	}

	.illustrator-card__printings {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
</style>
