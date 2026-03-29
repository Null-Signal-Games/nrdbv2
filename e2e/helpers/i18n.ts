import { locales } from "../../src/lib/paraglide/runtime.js";

export const availableLocales = locales;

// Normalize a locale string by trimming slashes
export const normalizeLocale = (locale: string | null | undefined): string | null => {
    if (!locale) {
        return null;
    }
    return locale.replace(/^\/+|\/+$/g, '');
}

// Build a locale-prefixed path, skipping 'en' as the default locale.
export const buildLocalePath = (path: string, locale?: string | null): string => {
    const normalized = normalizeLocale(locale ?? null);

    if (!normalized || normalized === 'en') {
        return path;
    }

    const cleanPath = path === '/' ? '' : path.replace(/^\/+/, '');
    return `/${normalized}/${cleanPath}`.replace(/\/+$/, '/') === `/${normalized}/`
        ? `/${normalized}/`
        : `/${normalized}/${cleanPath}`;
}