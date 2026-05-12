import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { adaptCard, adaptPrinting, adaptCardCycle, adaptCardSet, adaptFaction } from './adapter.js';
import fs from 'fs';
import path from 'path';
import type {
	Card,
	Printing,
	UnifiedCardRow,
	UnifiedPrintingRow,
	CardCycleRow,
	CardSetRow,
	FactionRow,
	Cycle,
	Set,
	Faction
} from './types.js';

// Run ./fetch-test-data.sh to download a full copy of the API and DB data for testing if not present.
describe('Card Adapter', () => {
	it('correctly adapts all cards from sqlite to match API output', () => {
		// 1. Get ground truth from cards.json
		const cardsJsonPath = path.resolve(__dirname, '../../cards.json');
		const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'));
		const expectedCards = cardsData.data as Card[];

		// 2. Fetch rows from database
		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare('SELECT * FROM unified_cards').all() as UnifiedCardRow[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedCards.length);

		const expectedMap = new Map(expectedCards.map((c: Card) => [c.id, c]));
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

describe('Printing Adapter', () => {
	it('correctly adapts all printings from sqlite to match API output', () => {
		const printingsJsonPath = path.resolve(__dirname, '../../printings.json');
		const printingsData = JSON.parse(fs.readFileSync(printingsJsonPath, 'utf8'));
		const expectedPrintings = printingsData.data as Printing[];

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare('SELECT * FROM unified_printings').all() as UnifiedPrintingRow[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedPrintings.length);

		const expectedMap = new Map(expectedPrintings.map((c: Printing) => [c.id, c]));
		const typeCounts = new Map<string, number>();

		for (const row of rows) {
			const typeId = row.card_type_id || 'unknown';
			typeCounts.set(typeId, (typeCounts.get(typeId) || 0) + 1);

			const expectedPrinting = expectedMap.get(row.id);
			expect(expectedPrinting, `Missing expected printing for id ${row.id}`).toBeDefined();

			const adapted = adaptPrinting(row);
			expect(adapted).toEqual(expectedPrinting);
		}

		console.log('Printings tested by type:', Object.fromEntries(typeCounts));
	});
});

describe('Card Cycle Adapter', () => {
	it('correctly adapts all cycles from sqlite to match API output', () => {
		const cyclesJsonPath = path.resolve(__dirname, '../../card_cycles.json');
		const cyclesData = JSON.parse(fs.readFileSync(cyclesJsonPath, 'utf8'));
		const expectedCycles = cyclesData.data as Cycle[];

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const query = `
			SELECT
				cc.*,
				(
					SELECT json_group_array(id)
					FROM card_sets
					WHERE card_cycle_id = cc.id
				) as card_set_ids,
				(
					SELECT id
					FROM unified_printings
					WHERE card_cycle_id = cc.id
					ORDER BY id ASC
					LIMIT 1
				) as first_printing_id
			FROM card_cycles cc
		`;
		const rows = db.prepare(query).all() as CardCycleRow[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedCycles.length);

		let recordsCompared = 0;
		const expectedMap = new Map(expectedCycles.map((c: Cycle) => [c.id, c]));

		for (const row of rows) {
			const expectedCycle = expectedMap.get(row.id);
			expect(expectedCycle, `Missing expected cycle for id ${row.id}`).toBeDefined();

			const adapted = adaptCardCycle(row);
			expect(adapted).toEqual(expectedCycle);
			recordsCompared++;
		}

		console.log(`Cycles tested: ${recordsCompared}`);
	});
});

describe('Card Set Adapter', () => {
	it('correctly adapts all sets from sqlite to match API output', () => {
		const setsJsonPath = path.resolve(__dirname, '../../card_sets.json');
		const setsData = JSON.parse(fs.readFileSync(setsJsonPath, 'utf8'));
		const expectedSets = setsData.data as Set[];

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const query = `
			SELECT
				cs.*,
				(
					SELECT id
					FROM unified_printings
					WHERE card_set_id = cs.id
					ORDER BY id ASC
					LIMIT 1
				) as first_printing_id
			FROM card_sets cs
		`;
		const rows = db.prepare(query).all() as CardSetRow[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedSets.length);

		let recordsCompared = 0;
		const expectedMap = new Map(expectedSets.map((c: Set) => [c.id, c]));

		for (const row of rows) {
			const expectedSet = expectedMap.get(row.id);
			expect(expectedSet, `Missing expected set for id ${row.id}`).toBeDefined();

			const adapted = adaptCardSet(row);
			expect(adapted).toEqual(expectedSet);
			recordsCompared++;
		}

		console.log(`Sets tested: ${recordsCompared}`);
	});
});

describe('Faction Adapter', () => {
	it('correctly adapts all factions from sqlite to match API output', () => {
		const factionsJsonPath = path.resolve(__dirname, '../../factions.json');
		const factionsData = JSON.parse(fs.readFileSync(factionsJsonPath, 'utf8'));
		const expectedFactions = factionsData.data as Faction[];

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare('SELECT * FROM factions').all() as FactionRow[];
		db.close();

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedFactions.length);

		let recordsCompared = 0;
		const expectedMap = new Map(expectedFactions.map((c: Faction) => [c.id, c]));

		for (const row of rows) {
			const expectedFaction = expectedMap.get(row.id);
			expect(expectedFaction, `Missing expected faction for id ${row.id}`).toBeDefined();

			const adapted = adaptFaction(row);
			expect(adapted).toEqual(expectedFaction);
			recordsCompared++;
		}

		console.log(`Factions tested: ${recordsCompared}`);
	});
});
