import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { adaptCard, adaptPrinting } from './adapter.js';
import fs from 'fs';
import path from 'path';
import type { Card, Printing } from './types.js';

describe('Card Adapter', () => {
	it('correctly adapts all cards from sqlite to match API output', () => {
		// 1. Get ground truth from cards.json
		const cardsJsonPath = path.resolve(__dirname, '../../cards.json');
		const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'));
		const expectedCards = cardsData.data as Card[];

		// 2. Fetch rows from database
		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare('SELECT * FROM unified_cards').all() as Record<string, unknown>[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedCards.length);

		const expectedMap = new Map(expectedCards.map((c: Card) => [c.id, c]));
		const typeCounts = new Map<string, number>();

		// 3. Adapt rows and compare
		for (const row of rows) {
			const typeId = (row.card_type_id as string) || 'unknown';
			typeCounts.set(typeId, (typeCounts.get(typeId) || 0) + 1);

			const expectedCard = expectedMap.get(row.id as string);
			expect(expectedCard, `Missing expected card for id ${row.id}`).toBeDefined();

			const adaptedCard = adaptCard(row);
			expect(adaptedCard).toEqual(expectedCard);
		}

		console.log('Cards tested by type:', Object.fromEntries(typeCounts));
	});
});

describe('Printing Adapter', () => {
	it('correctly adapts all printings from sqlite to match API output', () => {
		const printingsJsonPath = path.resolve(__dirname, '../../printings.json');
		const printingsData = JSON.parse(fs.readFileSync(printingsJsonPath, 'utf8'));
		const expectedPrintings = printingsData.data as Printing[];

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare('SELECT * FROM unified_printings').all() as Record<string, unknown>[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedPrintings.length);

		const expectedMap = new Map(expectedPrintings.map((c: Printing) => [c.id, c]));
		const typeCounts = new Map<string, number>();

		for (const row of rows) {
			const typeId = (row.card_type_id as string) || 'unknown';
			typeCounts.set(typeId, (typeCounts.get(typeId) || 0) + 1);

			const expectedPrinting = expectedMap.get(row.id as string);
			expect(expectedPrinting, `Missing expected printing for id ${row.id}`).toBeDefined();

			const adapted = adaptPrinting(row);
			expect(adapted).toEqual(expectedPrinting);
		}

		console.log('Printings tested by type:', Object.fromEntries(typeCounts));
	});
});
