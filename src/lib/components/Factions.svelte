<script lang="ts">
	import type { FactionIds } from '$lib/types';
	import { factions } from '$lib/i18n';
	import Icon from '$lib/components/Icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	const display_factions: FactionIds[] = [
		'anarch',
		'criminal',
		'haas_bioroid',
		'jinteki',
		'nbn',
		'shaper',
		'weyland_consortium'
	];
</script>

<div class="factions">
	{#each display_factions as faction (faction)}
		<a
			href={localizeHref('/faction/' + faction)}
			class="factions__item"
			style="--color: var(--{faction})"
		>
			<Icon name={faction} />
			{factions[faction]}
		</a>
	{/each}
</div>

<style>
	/* Temporary styles */
	.factions {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.factions__item {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: 1px solid var(--color);
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
	}
</style>
