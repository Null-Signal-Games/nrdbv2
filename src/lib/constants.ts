import { m } from '$lib/paraglide/messages.js';
import { localizeHref } from '$lib/paraglide/runtime.js';

export const APP_NAME = 'NetrunnerDB';
export const NRDB_IMAGE_URL = 'https://card-images.netrunnerdb.com/v2';
export const NRDB_API_URL = 'https://api.netrunnerdb.com/api/v3/public';
export const NRDB_PRIVATE_API_URL = 'https://api-preview.netrunnerdb.com/api/v3/private';
export const NRDB_CLASSIC_URL = 'https://netrunnerdb.com/en';
export const SEARCH_LIMIT = 20;

export const NAVIGATION = [
    {
        title: m.home(),
        url: localizeHref('/')
    },
    {
        title: m.my_decks(),
        url: localizeHref('/decks')
    },
    {
        title: m.decklists(),
        url: localizeHref('/decklists')
    },
    {
        title: m.sets(),
        url: localizeHref('/sets')
    },
    {
        title: m.cycles(),
        url: localizeHref('/cycles')
    },
    {
        title: m.factions(),
        url: localizeHref('/factions')
    },
    {
        title: m.formats(),
        url: localizeHref('/formats')
    },
    {
        title: m.reviews(),
        url: localizeHref('/reviews')
    },
    {
        title: m.rulings(),
        url: localizeHref('/rulings')
    },
    {
        title: m.illustrators(),
        url: localizeHref('/illustrators')
    }
];