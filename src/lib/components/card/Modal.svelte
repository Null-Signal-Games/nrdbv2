<script lang="ts">
	import { Dialog } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Card, Printing } from '$lib/types';
	import { getPrintingById } from '$lib/printings';
	import CardImage from './CardImage.svelte';
	import ModalInfo from './ModalInfo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import './card-modal.css';

	interface Props {
		card: Card;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { card, open, onOpenChange }: Props = $props();
	let hydrated_printing = $state.raw<Printing | null>(null);

	$effect(() => {
		hydrated_printing = null;
		if (!open) return;

		let cancelled = false;
		void (async () => {
			try {
				const printing = await getPrintingById(card.attributes.latest_printing_id);
				if (!cancelled) {
					hydrated_printing = printing;
				}
			} catch {
				return;
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	const printing = $derived(
		hydrated_printing?.id === card.attributes.latest_printing_id ? hydrated_printing : null
	);
	const attributes = $derived((printing ?? card).attributes);
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="card-modal__overlay" />
		<Dialog.Content
			class="card-modal"
			data-id="card-modal"
			style="--faction: var(--{attributes.faction_id}); --faction-contrast: var(--{attributes.faction_id}-contrast)"
		>
			<div class="card-modal__art">
				<CardImage card={printing ?? card} loading="eager" href={null} />
			</div>

			<div class="card-modal__info">
				<ModalInfo {card} {printing} />

				<Dialog.Close class="card-modal__close">
					<XIcon size={16} />
					<span class="visually-hidden">Close</span>
				</Dialog.Close>
			</div>

			<div class="card-modal__actions">
				<Button
					color="secondary"
					href={localizeHref(`/decklists/search?cards[]=${card.id}`)}
				>
					Decklists with this card
				</Button>
				<Button href={localizeHref(`/card/${card.id}`)}>View full card page</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
