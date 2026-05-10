<script lang="ts">
    import "../app.css";
    import { onMount, type Snippet } from "svelte";
    import { onNavigate } from "$app/navigation";
    import { theme as current_theme, db_ready } from "$lib/store";
    import Meta from "$lib/components/Meta.svelte";
    import Navigation from "$lib/components/Navigation.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { dev } from "$app/environment";
    import Debug from "$lib/components/Debug.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { sql, overwriteDatabaseFile } from "$lib/sqlite";
    import { fetch_published_databases } from "$lib/utils";
    import {
        CURRENT_SQLITE_URL_FILENAME,
        NRDB_SQLITE_NAME,
        NRDB_CACHE_COOKIE,
    } from "$lib/constants";

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
        try {
            const [root, sqlite_url] = await Promise.all([
                navigator.storage.getDirectory(),
                fetch_published_databases()
            ]);

            if (sqlite_url === null) {
                throw new Error("No valid database URL found in published_databases response");
            }

            try {
                await root.getFileHandle(NRDB_SQLITE_NAME);
                console.log(
                    `[SQLITE] ${NRDB_SQLITE_NAME} already exists in OPFS. Skipping download.`,
                );
            } catch (error) {
                console.log(
                    `[SQLITE] ${NRDB_SQLITE_NAME} not found in OPFS. Fetching from network...`,
                );

                if (
                    !(
                        error instanceof DOMException &&
                        error.name === "NotFoundError"
                    )
                ) {
                    throw error;
                }

                console.log("[SQLITE] Fetching and decompressing sqlite db...");
                const response = await fetch(sqlite_url);

                if (!response.ok) {
                    throw new Error(
                        `Network response failed: ${response.status}`,
                    );
                }

                if (!response.body) {
                    throw new Error("Response body was empty");
                }

                if (typeof DecompressionStream === "undefined") {
                    throw new Error(
                        "DecompressionStream is not supported in this browser",
                    );
                }

                const decompressedStream = response.body.pipeThrough(
                    new DecompressionStream("gzip"),
                );

                await overwriteDatabaseFile(decompressedStream);

                console.log(
                    `[SQLITE] ${NRDB_SQLITE_NAME} downloaded and saved to OPFS.`,
                );
            }

            // Write the current sqlite URL to OPFS so we know which version we have
            const urlHandle = await root.getFileHandle(CURRENT_SQLITE_URL_FILENAME, { create: true });
            const writable = await urlHandle.createWritable();
            await writable.write(sqlite_url);
            await writable.close();

            // console.log("[SQLITE] Tables:");

            // if (dev) {
            //     console.dir(
            //         await sql`SELECT name FROM sqlite_master WHERE type = 'table'`,
            //     );
            //     console.dir(await sql`SELECT * FROM unified_cards LIMIT 5`);
            // }

            db_ready.set(true);

            // 30 days
            document.cookie = `${NRDB_CACHE_COOKIE}=1; max-age=2592000; path=/`;
        } catch (error) {
            console.error(
                "[SQLITE] Failed to initialize local database:",
                error,
            );

            // Clear stale cookie so next page load falls back to SSR
            document.cookie = `${NRDB_CACHE_COOKIE}=; max-age=0; path=/`;
        }

        // Scroll tracking (always runs regardless of DB state)
        document.body.style.setProperty("--scroll", `${window.scrollY}px`);

        window.addEventListener("scroll", () => {
            document.body.style.setProperty("--scroll", `${window.scrollY}px`);
        });

        // Handle light/dark theme
        // TODO(theme): review, as currently we utilise `light-dark` in CSS, which us purely based on user preference
        if (!localStorage.getItem("theme")) {
            console.log("[THEME] Setting theme based on user preference");

            const user_prefers_dark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;

            const value = user_prefers_dark ? "dark" : "light";

            localStorage.setItem("theme", value);
            $current_theme = value;
        } else {
            document.documentElement.setAttribute(
                "data-theme",
                localStorage.getItem("theme") || "light",
            );
            $current_theme =
                (localStorage.getItem("theme") as "light" | "dark") || "light";
        }
    });
</script>

{#if dev}
    <Debug />
{/if}

<Navigation />

<Meta />

<main class="root">
    {@render children?.()}
</main>

<Footer />

<Tooltip />
