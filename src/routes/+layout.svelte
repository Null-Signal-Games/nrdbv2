<script lang="ts">
    import "../app.css";
    import { onMount, type Snippet } from "svelte";
    import { onNavigate } from "$app/navigation";
    import { initialize_app_data, CACHE_TTL_MS } from "$lib/utils";
    import {
        cards,
        cycles,
        sets,
        factions,
        formats,
        printings,
    } from "$lib/store";
    import Meta from "$lib/components/Meta.svelte";
    import { db } from "$lib/db";
    import Navigation from "$lib/components/Navigation.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { dev } from "$app/environment";
    import Debug from "$lib/components/Debug.svelte";
    import type {
        Card,
        Cycle,
        Set,
        Faction,
        Format,
        Printing,
    } from "$lib/types";
    import Tooltip from "$lib/components/Tooltip.svelte";

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    onMount(async () => {
        const stores = [cards, cycles, sets, factions, formats, printings];
        let all_populated: boolean = true;

        // Only skip loading if ALL stores already have data
        const unsubs = stores.map((store) =>
            store.subscribe((value) => {
                if (!value || value.length === 0) all_populated = false;
            }),
        );

        // Unsubscribe from all stores
        unsubs.forEach((unsub) => unsub());

        if (all_populated) {
            // console.info('Using in-memory store data');
            return;
        }

        // If no data found in Svelte store, check if cached data is fresh
        try {
            const cached_meta = await db.meta.get("last_updated");
            const is_stale =
                !cached_meta ||
                Date.now() - Number(cached_meta.value) > CACHE_TTL_MS;

            if (is_stale) {
                console.info("Cache is stale or missing, fetching from API.");
                await initialize_app_data();
            } else {
                // Load all tables from IndexedDB
                const cached_cards: Card[] = await db.cards.toArray();
                const cached_cycles: Cycle[] = await db.cycles.toArray();
                const cached_sets: Set[] = await db.sets.toArray();
                const cached_factions: Faction[] = await db.factions.toArray();
                const cached_formats: Format[] = await db.formats.toArray();
                const cached_printings: Printing[] =
                    await db.printings.toArray();

                // If cached data is found, use it
                if (
                    cached_cards.length > 0 &&
                    cached_cycles.length > 0 &&
                    cached_sets.length > 0 &&
                    cached_factions.length > 0 &&
                    cached_formats.length > 0 &&
                    cached_printings.length > 0
                ) {
                    console.info("Using cached data from IndexedDB.");
                    cards.set(cached_cards);
                    cycles.set(cached_cycles);
                    sets.set(cached_sets);
                    factions.set(cached_factions);
                    formats.set(cached_formats);
                    printings.set(cached_printings);
                } else {
                    console.info("Incomplete cached data, fetching from API.");
                    await initialize_app_data();
                }
            }

            // Pass cookie to the server that cache is warm
            document.cookie = `nrdb_cache=1; max-age=${Math.floor(CACHE_TTL_MS / 1000)}; path=/; SameSite=Lax`;
        } catch (err) {
            console.error("Failed to load app data:", err);
        }

        document.body.style.setProperty("--scroll", `${window.scrollY}px`);

        window.addEventListener("scroll", () => {
            document.body.style.setProperty("--scroll", `${window.scrollY}px`);
        });

        // Handle light/dark theme
        // TODO(theme): review, as currently we utilise `light-dark` in CSS, which us purely based on user preference
        const user_prefers_dark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const theme = localStorage.getItem("theme");
        document.documentElement.setAttribute(
            "data-theme",
            theme === "dark" || (!theme && user_prefers_dark)
                ? "dark"
                : "light",
        );
    });
</script>

{#if dev}
    <Debug />
{/if}

<Navigation />

<Meta />

<main>
    {@render children?.()}
</main>

<Footer />

<Tooltip />
