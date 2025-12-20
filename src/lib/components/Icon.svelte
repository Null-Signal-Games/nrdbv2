<script lang="ts">
	import type { FactionIds, CardTypeIds } from '$lib/types';

	interface Props {
		// TODO(types): refactor `string` to specific icon names later
		name: FactionIds | CardTypeIds | string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fill' | 'none';
		class?: string;
		label?: string;
		theme?: FactionIds;
	}

	let { name, size = 'lg', class: class_list = '', label = name, theme }: Props = $props();

	const icons: Record<Props['name'], string> = {
		adam: 'faction-adam',
		anarch: 'faction-anarch',
		apex: 'faction-apex',
		criminal: 'faction-criminal',
		haas_bioroid: 'faction-haas-bioroid',
		jinteki: 'faction-jinteki',
		nbn: 'faction-nbn',
		neutral_corp: 'faction-neutral',
		neutral_runner: 'faction-neutral',
		shaper: 'faction-shaper',
		sunny_lebeau: 'faction-sunny-lebeau',
		weyland_consortium: 'faction-weyland-consortium',
		agenda_points_simple: 'game-agenda-points-simple',
		agenda_points: 'game-agenda-points',
		click: 'click',
		credit: 'credit',
		interrupt: 'interrupt',
		link: 'game-link',
		mu: 'game-mu',
		rez_cost: 'game-rez-cost',
		strength: 'strength',
		subroutine: 'subroutine',
		trash_ability: 'trash',
		trash_cost: 'trash',
		trash: 'trash',
		ashes: 'set-ashes',
		borealis: 'set-borealis',
		core_set: 'set-core-set',
		creation_and_control: 'set-creation-and-control',
		data_and_destiny: 'set-data-and-destiny',
		draft: 'set-draft',
		flashpoint: 'set-flashpoint',
		genesis: 'set-genesis',
		honor_and_profit: 'set-honor-and-profit',
		kitara: 'set-kitara',
		liberation: 'set-liberation',
		lunar: 'set-lunar',
		magnum_opus_reprint: 'set-magnum-opus-reprint',
		magnum_opus: 'set-magnum-opus',
		mumbad: 'set-mumbad',
		napd_multiplayer: 'set-napd-multiplayer',
		order_and_chaos: 'set-order-and-chaos',
		red_sand: 'set-red-sand',
		reign_and_reverie: 'set-reign-and-reverie',
		revised_core_set: 'set-revised-core-set',
		salvaged_memories: 'set-salvaged-memories',
		sansan: 'set-sansan',
		spin: 'set-spin',
		system_gateway: 'set-system-gateway',
		terminal_directive: 'set-terminal-directive',
		agenda: 'type-agenda',
		asset: 'type-asset',
		event: 'type-event',
		hardware: 'type-hardware',
		ice: 'type-ice',
		identity: 'type-identity',
		operation: 'type-operation',
		program: 'type-program',
		resource: 'type-resource',
		upgrade: 'type-upgrade',
		null_signal_games: 'faction-neutral',
		nsg: 'faction-neutral',
		fantasy_flight_games: 'fantasy-flight-games',
		ffg: 'fantasy-flight-games',
		corp_identity: 'type-identity',
		runner_identity: 'type-identity',
		certificate: 'certificate',
		rotation: 'rotation',
		heart: 'heart',
		star: 'star',
		comment: 'comment',
		alwaysberunning: 'alwaysberunning',
		external: 'external',
		crimson_dust: 'set-crimson_dust',
		uprising: 'set-uprising',
		system_core_2019: 'set-system_core_2019',
		system_update_2021: 'set-system_update_2021'
	};
</script>

{#snippet svg_path(value: string)}
	<svg
		class={`icon icon--${size} ${class_list}`}
		aria-label={label}
		style={theme ? `color: var(--${theme})` : ''}
	>
		<use xlink:href="/icons.svg#{value}"></use>
	</svg>
{/snippet}

{#if icons?.[name]}
	{@render svg_path(icons[name])}
{:else}
	{@render svg_path(icons['neutral'])}
{/if}

<style>
	.icon {
		fill: currentColor;
		width: var(--icon-size);
		height: var(--icon-size);
	}

	.icon--xs {
		--icon-size: 0.75rem;
	}

	.icon--sm {
		--icon-size: 1rem;
	}

	.icon--md {
		--icon-size: 1.25rem;
	}

	.icon--lg {
		--icon-size: 1.5rem;
	}

	.icon--xl {
		--icon-size: 1.75rem;
	}
</style>
