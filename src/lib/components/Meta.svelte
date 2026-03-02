<script lang="ts">
    import { type Snippet } from "svelte";
    import favicon from "$lib/assets/favicon.png";
    import faviconDev from "$lib/assets/favicon-dev.png";
    import { APP_NAME } from "$lib/constants";
    import { getLocale, locales } from "$lib/paraglide/runtime.js";
    import { page } from "$app/state";

    interface Props {
        children?: Snippet;
        title?: string;
        og_title?: string;
        og_description?: string;
    }

    const { children, title, og_title, og_description }: Props = $props();

    const prefix = import.meta.env.DEV ? "(DEV) " : "";
    const title_formatted = $derived(
        title ? `${prefix + title} - ${APP_NAME}` : `${prefix}${APP_NAME}`,
    );
</script>

<svelte:head>
    <title>{title_formatted}</title>
    <link rel="icon" href={import.meta.env.DEV ? faviconDev : favicon} />
    <meta property="og:site_name" content={APP_NAME} />

    {@render children?.()}

    {#if og_title}
        <meta property="og:title" content={og_title} />
    {/if}

    {#if og_description}
        <meta property="og:description" content={og_description} />
    {/if}

    <meta property="og:locale" content={page.data.locale} />
    {#each locales as locale (locale)}
        {#if locale !== getLocale()}
            <meta property="og:locale:alternate" content={locale} />
        {/if}
    {/each}
</svelte:head>
