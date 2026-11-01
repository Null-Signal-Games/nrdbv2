<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { Card } from '$lib/types';
	import { openCardModal } from '$lib/store';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		identity: Card;
		name: string;
		children?: Snippet;
		actions?: Snippet;
	}

	let { identity, name, children, actions }: Props = $props();

	const faction_id = $derived(identity.attributes.faction_id);
	const [identity_name, identity_subtitle] = $derived(identity.attributes.title.split(': '));
</script>

<header class="deck-header">
	<button
		type="button"
		class="deck-header__art"
		aria-haspopup="dialog"
		aria-label={identity.attributes.title}
		onclick={() => openCardModal(identity)}
	>
		<CardImage card={identity} loading="eager" href={null} />
	</button>

	<div class="deck-header__info">
		<span class="deck-header__watermark watermark" aria-hidden="true">
			<Icon
				name={faction_id}
				theme={faction_id}
				size="none"
				class="deck-header__watermark-icon"
			/>
		</span>

		<div class="deck-header__details">
			<hgroup class="deck-header__heading">
				<h1 class="deck-header__title">{name}</h1>
				<p class="deck-header__identity">
					<Icon name={faction_id} theme={faction_id} />
					{identity_name}
					{#if identity_subtitle}
						<span>{identity_subtitle}</span>
					{/if}
				</p>
			</hgroup>

			{#if children}
				<hr />
				{@render children()}
			{/if}

			{#if actions}
				<div class="deck-header__actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.deck-header {
		display: grid;
		grid-template-columns: 13rem minmax(0, 1fr);
	}

	.deck-header__art {
		position: relative;
		z-index: 1;
		align-self: center;
		padding: 0;
		border: 0;
		border-radius: var(--card-radius);
		background: transparent;
		cursor: zoom-in;
	}

	.deck-header__art:focus-visible {
		outline: 3px solid currentColor;
		outline-offset: 3px;
	}

	.deck-header__info {
		box-sizing: border-box;
		position: relative;
		display: flex;
		overflow: hidden;
		margin-block: 0.75rem;
		margin-inline-start: -1rem;
		padding: 1rem 1rem 1rem 2rem;
		background-color: var(--foreground);
		border: 1px solid var(--border);
	}

	.deck-header__watermark {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		opacity: 0.12;
		pointer-events: none;
	}

	.deck-header__watermark :global(.deck-header__watermark-icon) {
		width: auto;
		height: 140%;
		translate: 20% 0;
	}

	.deck-header__details {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.deck-header__details hr {
		width: 100%;
		margin: 0;
		border: none;
		border-top: 1px solid var(--border);
	}

	.deck-header__heading {
		display: grid;
		gap: 0.25rem;
	}

	.deck-header__title {
		margin: 0;
		font-size: var(--font-size-3xl);
		line-height: var(--leading-tight);
		overflow-wrap: anywhere;
	}

	.deck-header__identity {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.375rem;
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
	}

	.deck-header__identity > :global(svg) {
		align-self: baseline;
		width: 1em;
		height: 1em;
		translate: 0 0.12em;
	}

	.deck-header__identity span {
		color: var(--text-muted);
		font-weight: var(--font-weight-normal);
	}

	.deck-header__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
