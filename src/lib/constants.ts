import { m } from '$lib/paraglide/messages.js';
import { localizeHref } from '$lib/paraglide/runtime.js';
import type { CardTypeIds } from './types';

const NRDB_API = 'https://api.netrunnerdb.com/api/v3';
const NRDB_API_PREVIEW = 'https://api-preview.netrunnerdb.com/api/v3';

export const APP_NAME = 'NetrunnerDB';
export const NRDB_IMAGE_URL = 'https://card-images.netrunnerdb.com/v2';
export const NRDB_API_URL = `${NRDB_API}/public`;
export const NRDB_PRIVATE_API_URL = `${NRDB_API_PREVIEW}/private`;
export const NRDB_CLASSIC_URL = 'https://netrunnerdb.com/en';
export const NRDB_SQLITE_URL = "https://card-images.netrunnerdb.com/sqlite-tmp/netrunnerdb.sqlite3.1773596450.gz";
export const NRDB_SQLITE_NAME = "netrunnerdb.sqlite3";
export const NRDB_CACHE_COOKIE = "nrdb_cache";
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

export const CARD_TYPES: CardTypeIds[] = [
    'agenda',
    'asset',
    'corp_identity',
    'event',
    'hardware',
    'ice',
    'operation',
    'program',
    'resource',
    'runner_identity',
    'upgrade'
];
