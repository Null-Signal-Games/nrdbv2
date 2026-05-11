import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { adaptCard } from './adapter';
import fs from 'fs';
import path from 'path';
import { Card } from './types';

describe('Card Adapter', () => {
	it('correctly adapts all cards from sqlite to match API output', () => {
		// 1. Get ground truth from cards.json
		const cardsJsonPath = path.resolve(__dirname, '../../cards.json');
		const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'));
		const expectedCards = cardsData.data as Card[];

		// 2. Fetch rows from database
		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare("SELECT * FROM unified_cards").all();
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedCards.length);

		const expectedMap = new Map(expectedCards.map((c: any) => [c.id, c]));
		const typeCounts = new Map<string, number>();

		// 3. Adapt rows and compare
		for (const row of rows) {
			const typeId = row.card_type_id || 'unknown';
			typeCounts.set(typeId, (typeCounts.get(typeId) || 0) + 1);

			const expectedCard = expectedMap.get(row.id);
			expect(expectedCard, `Missing expected card for id ${row.id}`).toBeDefined();

			const adaptedCard = adaptCard(row);
			expect(adaptedCard).toEqual(expectedCard);
		}

		console.log('Cards tested by type:', Object.fromEntries(typeCounts));
	});
});
