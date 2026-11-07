import { SQLocal } from 'sqlocal';
import { NRDB_SQLITE_NAME, CURRENT_SQLITE_URL_FILENAME } from '$lib/constants';
import { fetch_published_databases } from '$lib/utils';

const { sql: run_query, overwriteDatabaseFile, deleteDatabaseFile } = new SQLocal(NRDB_SQLITE_NAME);

export const sql: typeof run_query = async (queryTemplate, ...params) => {
	await ensure_db_ready();
	return run_query(queryTemplate, ...params);
};

const REQUIRED_TABLES = ['unified_cards', 'card_sets', 'card_cycles', 'card_subtypes'];

export const get_current_sqlite_url = async (): Promise<string | null> => {
	console.info(`[SQLITE] Getting current SQLite URL from ${CURRENT_SQLITE_URL_FILENAME}`);
	try {
		const root = await navigator.storage.getDirectory();
		const urlHandle = await root.getFileHandle(CURRENT_SQLITE_URL_FILENAME);
		const file = await urlHandle.getFile();
		return await file.text();
	} catch (error) {
		console.error(
			`[SQLITE] Failed to get current SQLite URL from (${CURRENT_SQLITE_URL_FILENAME}): `,
			error
		);
		if (error instanceof DOMException && error.name === 'NotFoundError') {
			console.error(`[SQLITE] ${CURRENT_SQLITE_URL_FILENAME} not found, returning null`);
			return null;
		}
		throw error;
	}
};

export const set_current_sqlite_url = async (url: string): Promise<void> => {
	const root = await navigator.storage.getDirectory();
	const urlHandle = await root.getFileHandle(CURRENT_SQLITE_URL_FILENAME, { create: true });
	const writable = await urlHandle.createWritable();
	await writable.write(url);
	await writable.close();
};

export const clear_current_sqlite_url = async (): Promise<void> => {
	console.info('[SQLITE] Clearing current SQLite URL');
	const root = await navigator.storage.getDirectory();
	try {
		await root.removeEntry(CURRENT_SQLITE_URL_FILENAME);
	} catch (error) {
		console.error('[SQLITE] Failed to clear current SQLite URL:', error);
		if (!(error instanceof DOMException && error.name === 'NotFoundError')) {
			throw error;
		}
	}
};

export const check_sqlite_db_populated = async (): Promise<boolean> => {
	console.info('[SQLITE] Checking if SQLite DB is populated');
	try {
		const placeholders = REQUIRED_TABLES.map(() => '?').join(', ');
		const rows = await run_query(
			`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${placeholders})`,
			...REQUIRED_TABLES
		);
		console.info(`[SQLITE] Found ${rows.length} of ${REQUIRED_TABLES.length} required tables`);
		// TODO: Validate that every card has a printing
		return rows.length === REQUIRED_TABLES.length;
	} catch (error) {
		console.error('[SQLITE] Failed to inspect the local database schema:', error);
		return false;
	}
};

export const reset_opfs_data = async (): Promise<void> => {
	console.info('[SQLITE] Resetting OPFS data');
	try {
		await deleteDatabaseFile();
		await clear_current_sqlite_url();
		console.info('[SQLITE] OPFS database and version marker removed');
	} catch (error) {
		console.error('[SQLITE] Failed to reset OPFS data:', error);
	}

	window.location.reload();
};

export const download_and_extract_sqlite = async (sqlite_url: string): Promise<void> => {
	console.info('[SQLITE] Fetching and decompressing SQLite db from URL:', sqlite_url);
	// Exit immediately if DecompressionStream is not supported, as we won't be able to process the downloaded gzip file.
	if (typeof DecompressionStream === 'undefined') {
		console.error('[SQLITE] DecompressionStream is not supported in this browser');
		throw new Error('DecompressionStream is not supported in this browser');
	}

	const response = await fetch(sqlite_url);

	if (!response.ok) {
		console.error('[SQLITE] Network response failed:', response.status);
		throw new Error(`Network response failed: ${response.status}`);
	}

	if (!response.body) {
		console.error('[SQLITE] Response body was empty');
		throw new Error('Response body was empty');
	}

	const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));

	console.info('[SQLITE] Overwriting local SQLite database with decompressed data');
	await overwriteDatabaseFile(decompressedStream);
};

const update_database = async (): Promise<void> => {
	const [sqlite_url, stored_url] = await Promise.all([
		fetch_published_databases(),
		get_current_sqlite_url()
	]);
	if (sqlite_url === null) {
		throw new Error('No valid database URL found in published_databases response');
	}
	if (stored_url === sqlite_url && (await check_sqlite_db_populated())) {
		console.log(`[SQLITE] ${NRDB_SQLITE_NAME} already exists and is up to date in OPFS.`);
		return;
	}
	await download_and_extract_sqlite(sqlite_url);
	console.log(`[SQLITE] ${NRDB_SQLITE_NAME} downloaded and saved to OPFS.`);
	await set_current_sqlite_url(sqlite_url);
};

const prepare_database = async (): Promise<void> => {
	try {
		await update_database();
	} catch (error) {
		console.error('[SQLITE] Failed to update local database:', error);
	}
	if (!(await check_sqlite_db_populated())) {
		throw new Error('Local database is unavailable');
	}
};

let db_ready_promise: Promise<void> | undefined;

export const ensure_db_ready = (): Promise<void> => (db_ready_promise ??= prepare_database());
