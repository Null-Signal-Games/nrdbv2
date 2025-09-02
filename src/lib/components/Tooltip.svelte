<script lang="ts">
	import { tooltip } from '$lib/store';
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import { page } from '$app/state';

	let tooltip_element: HTMLElement;

	const hide_tooltip = () => {
		tooltip.set({
			element: null,
			visible: false,
			card: null,
			position: {
				x: 0,
				y: 0
			}
		});
	};

	onMount(() => {
		window.addEventListener('scroll', () => hide_tooltip());
	});

	$effect(() => {
		// if ($tooltip.visible) {
		//     console.log('Tooltip visible', $tooltip.position.x, $tooltip.position.y);
		//     tooltip_element.style.setProperty('--height', `${tooltip_element.offsetHeight}px`);
		// }

		// Hide tooltip if the page changes
		if (page.url) {
			hide_tooltip();
		}

		// if ($tooltip.visible) {
		//     console.log('Tooltip visible', $tooltip.position.x, $tooltip.position.y);
		// }

		// TODO: add logic to check if the tooltip is outside the viewport and change the position/placement of it, to ensure it is always visible
		// if ($tooltip.visible) {
		//     const rect = tooltip_element.getBoundingClientRect();
		//     const windowWidth = window.innerWidth;
		//     const windowHeight = window.innerHeight;

		//     // Check if the tooltip is overflowing horizontally
		//     if (rect.left < 0) {
		//         tooltip_element.style.setProperty('--left', `0px`);
		//     } else if (rect.right > windowWidth) {
		//         tooltip_element.style.setProperty('--left', `${windowWidth - rect.width}px`);
		//     }

		//     // Check if the tooltip is overflowing vertically
		//     if (rect.top < 0) {
		//         tooltip_element.style.setProperty('--top', `0px`);
		//     } else if (rect.bottom > windowHeight) {
		//         tooltip_element.style.setProperty('--top', `${windowHeight - rect.height}px`);
		//     }
		// }
	});
</script>

<div
	bind:this={tooltip_element}
	style="--left: {$tooltip.position.x}px; --top: calc({$tooltip.position.y}px + var(--scroll));"
	class="tooltip"
	data-visible={$tooltip.visible}
>
	{#if $tooltip?.card}
		<div>
			<Card data={$tooltip.card} />
		</div>
		<div>
			<div>
				<p>{$tooltip.card?.attributes.title}</p>
				<span>
					{$tooltip.card?.attributes.card_type_id}
				</span>
			</div>
			{#if $tooltip.card.attributes?.text}
				<div data-faction-theme={$tooltip.card.attributes.faction_id}>
					{$tooltip.card.attributes.text}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Temporary styles */
	.tooltip {
		--spacing: 0.25rem;
		--caret: calc(var(--spacing) * 2);
		position: absolute;
		display: grid;
		gap: calc(var(--spacing) * 4);
		grid-template-columns: auto 1fr;
		/* align-items: start; */
		width: 100%;
		max-width: var(--tooltip);
		left: var(--left);
		top: var(--top);
		transform: translate(-50%, calc(-100% - var(--caret)));
		background-color: #fff;
		color: #000;
		pointer-events: none;
		opacity: 0;
		transition: opacity 120ms ease;
		max-width: 400px;
	}

	.tooltip[data-visible='true'] {
		pointer-events: auto;
		opacity: 1;
	}

	.tooltip::before,
	.tooltip::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 100%);
		border-style: solid;
	}

	.tooltip::before {
		border-width: calc(var(--spacing) * 3);
		border-color: black transparent transparent transparent;
	}

	.tooltip::after {
		border-width: calc(var(--spacing) * 2.5);
		border-color: black transparent transparent transparent;
	}
</style>
