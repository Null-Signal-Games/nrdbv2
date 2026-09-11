<script lang="ts">
	import { page } from '$app/state';
	import { cardModal, closeCardModal } from '$lib/store';
	import Modal from './Modal.svelte';

	$effect(() => {
		const current_url = page.url.href;
		return () => closeCardModal();
	});
</script>

{#if $cardModal}
	<Modal
		card={$cardModal.card}
		open
		onOpenChange={() => closeCardModal()}
	/>
{/if}
