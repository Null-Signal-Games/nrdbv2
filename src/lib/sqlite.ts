import { SQLocal } from 'sqlocal';
import { NRDB_SQLITE_NAME, CURRENT_SQLITE_URL_FILENAME } from '$lib/constants';

export const { sql, overwriteDatabaseFile } = new SQLocal(NRDB_SQLITE_NAME);

export const get_current_sqlite_url = async (): Promise<string | null> => {
	try {
		const root = await navigator.storage.getDirectory();
		const urlHandle = await root.getFileHandle(CURRENT_SQLITE_URL_FILENAME);
		const file = await urlHandle.getFile();
		return await file.text();
	} catch (error) {
		if (error instanceof DOMException && error.name === 'NotFoundError') {
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

export const check_sqlite_db_exists = async (): Promise<boolean> => {
	try {
		const root = await navigator.storage.getDirectory();
		await root.getFileHandle(NRDB_SQLITE_NAME);
		return true;
	} catch (error) {
		if (error instanceof DOMException && error.name === 'NotFoundError') {
			return false;
		}
		throw error;
	}
};

export const download_and_extract_sqlite = async (sqlite_url: string): Promise<void> => {
	const response = await fetch(sqlite_url);

	if (!response.ok) {
		throw new Error(`Network response failed: ${response.status}`);
	}

	if (!response.body) {
		throw new Error('Response body was empty');
	}

	if (typeof DecompressionStream === 'undefined') {
		throw new Error('DecompressionStream is not supported in this browser');
	}

	const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));

	await overwriteDatabaseFile(decompressedStream);
};
