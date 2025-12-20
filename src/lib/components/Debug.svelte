<script lang="ts">
	import { reset_indexeddb_data } from '$lib/utils';
	import { page } from '$app/state';
</script>

<div class="debug">
	<button onclick={reset_indexeddb_data}>Clear IndexedDB</button>
	<details>
		<summary>Session Data</summary>
		<pre>{JSON.stringify(page.data.session, null, 2)}</pre>
	</details>
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

	.debug :where(button, details) {
		padding: 0.5rem 0.75rem;
		background: var(--text);
		color: var(--foreground);
		border: unset;
		border-radius: 0.25rem;
	}
</style>
