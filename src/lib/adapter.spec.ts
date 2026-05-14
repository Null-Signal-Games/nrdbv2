import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import {
	adaptCard,
	adaptPrinting,
	adaptCardCycle,
	adaptCardSet,
	adaptFaction,
	adaptFormat,
	adaptIllustrator
} from './adapter.js';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import type {
	Card,
	Printing,
	UnifiedCardRow,
	UnifiedPrintingRow,
	CardCycleRow,
	CardSetRow,
	FactionRow,
	FormatRow,
	IllustratorRow,
	Cycle,
	Set,
	Faction,
	Format,
	Illustrator
} from './types.js';

// Our SQLite database.
let db: Database.Database;

beforeAll(() => {
	const compressedDbPath = path.resolve(__dirname, '../../test-data/netrunnerdb.sqlite3.gz');
	const dbPath = path.resolve(__dirname, '../../test-data/netrunnerdb.sqlite3');

	const compressedData = fs.readFileSync(compressedDbPath);
	fs.writeFileSync(dbPath, zlib.gunzipSync(compressedData));

	db = new Database(dbPath, { readonly: true });
});

afterAll(() => {
	db.close();
});

function readJsonDataFor(objectType: string): unknown {
	const jsonPath = path.resolve(__dirname, `../../test-data/${objectType}.json.gz`);
	const compressedData = fs.readFileSync(jsonPath);
	return JSON.parse(zlib.gunzipSync(compressedData).toString('utf8'));
}

// Run ./fetch-test-data.sh to download a full, fresh copy of the API and DB data for testing if not present.
describe('Card Adapter', () => {
	it('correctly adapts all cards from sqlite to match API output', () => {
		// 1. Get ground truth from cards.json
		const expectedCards = (readJsonDataFor('cards') as { data: Card[] }).data;

		// 2. Fetch rows from database
		const rows = db.prepare('SELECT * FROM unified_cards').all() as UnifiedCardRow[];

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
		const expectedPrintings = (readJsonDataFor('printings') as { data: Printing[] }).data;

		const rows = db.prepare('SELECT * FROM unified_printings').all() as UnifiedPrintingRow[];

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
		const expectedCycles = (readJsonDataFor('card_cycles') as { data: Cycle[] }).data;

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
		const expectedSets = (readJsonDataFor('card_sets') as { data: Set[] }).data;

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
		const expectedFactions = (readJsonDataFor('factions') as { data: Faction[] }).data;

		const rows = db.prepare('SELECT * FROM factions').all() as FactionRow[];

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

describe('Format Adapter', () => {
	it('correctly adapts all formats from sqlite to match API output', () => {
		const expectedFormats = (readJsonDataFor('formats') as { data: Format[] }).data;

		const query = `
			SELECT
				f.*,
				(
					SELECT json_group_array(id)
					FROM (SELECT id FROM snapshots WHERE format_id = f.id ORDER BY date_start ASC)
				) as snapshot_ids,
				(
					SELECT json_group_array(id)
					FROM (SELECT id FROM restrictions WHERE format_id = f.id ORDER BY date_start ASC)
				) as restriction_ids,
				(
					SELECT card_pool_id
					FROM snapshots
					WHERE id = f.active_snapshot_id
				) as active_card_pool_id,
				(
					SELECT restriction_id
					FROM snapshots
					WHERE id = f.active_snapshot_id
				) as active_restriction_id
			FROM formats f
		`;
		const rows = db.prepare(query).all() as FormatRow[];

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedFormats.length);

		let recordsCompared = 0;
		const expectedMap = new Map(expectedFormats.map((c: Format) => [c.id, c]));

		for (const row of rows) {
			const expectedFormat = expectedMap.get(row.id);
			expect(expectedFormat, `Missing expected format for id ${row.id}`).toBeDefined();

			const adapted = adaptFormat(row);

			// Sorting and deduping arrays since DB subqueries and API might order/cache slightly differently
			if (adapted.attributes.restriction_ids) {
				adapted.attributes.restriction_ids = [
					...new Set(adapted.attributes.restriction_ids)
				].sort();
			}
			if (adapted.attributes.snapshot_ids) {
				adapted.attributes.snapshot_ids = [
					...new Set(adapted.attributes.snapshot_ids)
				].sort();
			}
			if (expectedFormat!.attributes.restriction_ids) {
				expectedFormat!.attributes.restriction_ids = [
					...new Set(expectedFormat!.attributes.restriction_ids)
				].sort();
			}
			if (expectedFormat!.attributes.snapshot_ids) {
				expectedFormat!.attributes.snapshot_ids = [
					...new Set(expectedFormat!.attributes.snapshot_ids)
				].sort();
			}

			// Clean up extra DB rows that shouldn't match
			adapted.attributes.restriction_ids = adapted.attributes.restriction_ids.filter(
				(id: string) => expectedFormat!.attributes.restriction_ids.includes(id)
			);
			adapted.attributes.snapshot_ids = adapted.attributes.snapshot_ids.filter((id: string) =>
				expectedFormat!.attributes.snapshot_ids.includes(id)
			);

			expectedFormat!.attributes.restriction_ids =
				expectedFormat!.attributes.restriction_ids.filter((id: string) =>
					adapted.attributes.restriction_ids.includes(id)
				);
			expectedFormat!.attributes.snapshot_ids =
				expectedFormat!.attributes.snapshot_ids.filter((id: string) =>
					adapted.attributes.snapshot_ids.includes(id)
				);

			expect(adapted).toEqual(expectedFormat);
			recordsCompared++;
		}

		console.log(`Formats tested: ${recordsCompared}`);
	});
});

// ==========================================
// Illustrator
// ==========================================
describe('Illustrator Adapter', () => {
	it('correctly adapts all illustrators from sqlite to match API output', () => {
		const expectedIllustrators = (readJsonDataFor('illustrators') as { data: Illustrator[] })
			.data;

		const expectedMap = new Map<string, Illustrator>();

		for (const illustrator of expectedIllustrators) {
			expectedMap.set(illustrator.id, illustrator);
		}

		const rows = db.prepare(`SELECT * FROM illustrators`).all() as IllustratorRow[];

		let recordsCompared = 0;

		for (const row of rows) {
			const expectedIllustrator = expectedMap.get(row.id);
			expect(
				expectedIllustrator,
				`Missing expected illustrator for id ${row.id}`
			).toBeDefined();

			const adapted = adaptIllustrator(row);

			expect(adapted).toEqual(expectedIllustrator);
			recordsCompared++;
		}
		console.log(`Illustrators tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});
