import { describe, it, expect } from 'vitest';
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

describe('Format Adapter', () => {
	it('correctly adapts all formats from sqlite to match API output', () => {
		const formatsJsonPath = path.resolve(__dirname, '../../formats.json');
		const formatsData = JSON.parse(fs.readFileSync(formatsJsonPath, 'utf8'));
		const expectedFormats = formatsData.data as Format[];

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
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
		db.close();

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
		const apiJsonPath = path.join(process.cwd(), 'illustrators.json');
		if (!fs.existsSync(apiJsonPath)) {
			console.warn('illustrators.json not found, skipping comprehensive test.');
			return;
		}

		const apiData = JSON.parse(fs.readFileSync(apiJsonPath, 'utf8'));
		const expectedMap = new Map<string, Illustrator>();

		for (const illustrator of apiData.data) {
			expectedMap.set(illustrator.id, illustrator);
		}

		const dbPath = path.resolve(__dirname, '../../netrunnerdb.sqlite3');
		const db = new Database(dbPath);
		const rows = db.prepare(`SELECT * FROM illustrators`).all() as IllustratorRow[];
		db.close();

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
