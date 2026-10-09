<script lang="ts">
	interface Props {
		class?: string;
		[key: string]: unknown;
	}

	let { class: class_list = '', ...rest }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 148.2 143.72"
	aria-hidden="true"
	class="logo {class_list}"
	{...rest}
>
	<polygon
		fill="#ff0000"
		points="99.28 99.28 68.46 99.28 68.46 88.71 88.71 88.71 88.71 10.57 10.57 10.57 10.57 88.71 38.71 88.71 38.71 99.28 0 99.28 0 0 99.28 0 99.28 99.28"
	></polygon>
	<polygon
		fill="#0000ff"
		points="148.2 143.72 48.92 143.72 48.92 44.44 79.39 44.44 79.39 54.48 59.5 54.48 59.5 133.15 137.63 133.15 137.63 54.48 109.5 54.48 109.5 44.44 148.2 44.44 148.2 143.72"
	></polygon>
</svg>

<style>
	.logo {
		width: 1.5rem;
		height: auto;
	}
</style>
