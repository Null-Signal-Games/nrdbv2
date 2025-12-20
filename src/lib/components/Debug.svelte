<script lang="ts">
	import { reset_indexeddb_data } from '$lib/utils';
</script>

<div class="debug">
	<button onclick={reset_indexeddb_data}>Clear IndexedDB</button>
</div>

<style>
	.debug {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.debug button {
		padding: 0.5rem 0.75rem;
		background: var(--text);
		color: var(--foreground);
		border: unset;
		border-radius: 0.25rem;
	}
</style>
