<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();
</script>

<header>
	<h1>{title}</h1>
</header>
