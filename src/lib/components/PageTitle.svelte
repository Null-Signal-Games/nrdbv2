<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import faviconDev from '$lib/assets/favicon-dev.png';

	const { subtitle }: { subtitle?: string } = $props();

	const baseTitle = 'NetrunnerDB v2';
	const devPrefix = import.meta.env.DEV ? '(DEV) ' : '';
	const fullTitle = $derived(
		subtitle ? `${devPrefix}${subtitle} - ${baseTitle}` : `${devPrefix}${baseTitle}`
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<link rel="icon" href={import.meta.env.DEV ? faviconDev : favicon} />
</svelte:head>
