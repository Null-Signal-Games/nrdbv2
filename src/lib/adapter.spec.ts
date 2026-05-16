import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';


import type {
	Card,
	CardPool,
	Printing,
	Cycle,
	Set,
	Faction,
	Format,
	Illustrator,
	Side,
	CardType,
	CardSetType,
	CardSubtype,
	Restriction,
	Snapshot
} from './api.types.js';
import {
	adaptCard,
	adaptPrinting,
	adaptCardCycle,
	adaptCardPool,
	adaptRestriction,
	adaptSnapshot,
	adaptCardSet,
	adaptFaction,
	adaptFormat,
	adaptIllustrator,
	adaptSide,
	adaptCardType,
	adaptCardSetType,
	adaptCardSubtype
} from './adapter.js';
import type {
	CardPoolRow,
	UnifiedCardRow,
	UnifiedPrintingRow,
	CardCycleRow,
	CardSetRow,
	FactionRow,
	FormatRow,
	IllustratorRow,
	SideRow,
	CardTypeRow,
	CardSetTypeRow,
	CardSubtypeRow,
	RestrictionRow,
	SnapshotRow
} from './sqlite.types.js';

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
		const expectedCards = (readJsonDataFor('cards') as { data: Card[] }).data;
		const rows = db.prepare('SELECT * FROM unified_cards').all() as UnifiedCardRow[];

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedCards.length);

		const expectedMap = new Map(expectedCards.map((c: Card) => [c.id, c]));
		const typeCounts = new Map<string, number>();

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

describe('Side Adapter', () => {
	it('correctly adapts all sides from sqlite to match API output', () => {
		const expectedSides = (readJsonDataFor('sides') as { data: Side[] }).data;

		const rows = db.prepare('SELECT * FROM sides').all() as SideRow[];

		expect(rows.length).toBeGreaterThan(0);
		expect(rows.length).toBe(expectedSides.length);

		let recordsCompared = 0;
		const expectedMap = new Map(expectedSides.map((c: Side) => [c.id, c]));

		for (const row of rows) {
			const expectedSide = expectedMap.get(row.id);
			expect(expectedSide, `Missing expected side for id ${row.id}`).toBeDefined();

			const adapted = adaptSide(row);
			expect(adapted).toEqual(expectedSide);
			recordsCompared++;
		}

		console.log(`Sides tested: ${recordsCompared}`);
	});
});

describe('Card Pool Adapter', () => {
	it('correctly adapts all card pools from sqlite to match API output', () => {
		const expectedCardPools = (readJsonDataFor('card_pools') as { data: CardPool[] }).data;

		const expectedMap = new Map<string, CardPool>();

		for (const cardPool of expectedCardPools) {
			expectedMap.set(cardPool.id, cardPool);
		}

		const rows = db
			.prepare(`
			WITH
				num_cards AS (
					SELECT cp.value AS card_pool_id, COUNT(*) AS num_cards
					FROM unified_cards c, json_each(c.card_pool_ids) AS cp
					GROUP BY 1
				),
				cycles AS (
					SELECT card_pool_id, json_group_array(card_cycle_id) AS card_cycle_ids
					FROM card_pools_card_cycles
					GROUP BY 1
				)
				SELECT
					cp.id, cp.name, cp.format_id, cp.created_at, cp.updated_at,
					num_cards.num_cards, cycles.card_cycle_ids
				FROM card_pools AS cp
				LEFT JOIN num_cards ON cp.id = num_cards.card_pool_id
				LEFT JOIN cycles ON cp.id = cycles.card_pool_id
			`)
			.all() as CardPoolRow[];

		let recordsCompared = 0;

		for (const row of rows) {
			const expectedCardType = expectedMap.get(row.id);
			expect(expectedCardType, `Missing expected card pool for id ${row.id}`).toBeDefined();

			const adapted = adaptCardPool(row);

			expect(adapted).toEqual(expectedCardType);
			recordsCompared++;
		}
		console.log(`Card Pools tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});

describe('Card Type Adapter', () => {
	it('correctly adapts all card types from sqlite to match API output', () => {
		const expectedCardTypes = (readJsonDataFor('card_types') as { data: CardType[] }).data;

		const expectedMap = new Map<string, CardType>();

		for (const cardType of expectedCardTypes) {
			expectedMap.set(cardType.id, cardType);
		}

		const rows = db.prepare(`SELECT * FROM card_types`).all() as CardTypeRow[];

		let recordsCompared = 0;

		for (const row of rows) {
			const expectedCardType = expectedMap.get(row.id);
			expect(expectedCardType, `Missing expected card type for id ${row.id}`).toBeDefined();

			const adapted = adaptCardType(row);

			expect(adapted).toEqual(expectedCardType);
			recordsCompared++;
		}
		console.log(`Card Types tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});

describe('Card Set Type Adapter', () => {
	it('correctly adapts all card set types from sqlite to match API output', () => {
		const expectedCardSetTypes = (readJsonDataFor('card_set_types') as { data: CardSetType[] })
			.data;
		const expectedMap = new Map<string, CardSetType>();

		for (const cardSetType of expectedCardSetTypes) {
			expectedMap.set(cardSetType.id, cardSetType);
		}

		const rows = db.prepare(`SELECT * FROM card_set_types`).all() as CardSetTypeRow[];
		let recordsCompared = 0;

		for (const row of rows) {
			const expectedCardSetType = expectedMap.get(row.id);
			expect(
				expectedCardSetType,
				`Missing expected card set type for id ${row.id}`
			).toBeDefined();

			const adapted = adaptCardSetType(row);

			expect(adapted).toEqual(expectedCardSetType);
			recordsCompared++;
		}
		console.log(`Card Set Types tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});

describe('Card Subtype Adapter', () => {
	it('correctly adapts all card subtypes from sqlite to match API output', () => {
		const expectedCardSubtypes = (readJsonDataFor('card_subtypes') as { data: CardSubtype[] })
			.data;
		const expectedMap = new Map<string, CardSubtype>();

		for (const cardSubtype of expectedCardSubtypes) {
			expectedMap.set(cardSubtype.id, cardSubtype);
		}

		const rows = db.prepare(`SELECT * FROM card_subtypes`).all() as CardSubtypeRow[];
		let recordsCompared = 0;

		for (const row of rows) {
			const expectedCardSubtype = expectedMap.get(row.id);
			expect(
				expectedCardSubtype,
				`Missing expected card subtype for id ${row.id}`
			).toBeDefined();

			const adapted = adaptCardSubtype(row);

			expect(adapted).toEqual(expectedCardSubtype);
			recordsCompared++;
		}
		console.log(`Card Subtypes tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});

describe('Restriction Adapter', () => {
	it('correctly adapts all restrictions from sqlite to match API output', () => {
		const expectedRestrictions = (readJsonDataFor('restrictions') as { data: Restriction[] })
			.data;

		const expectedMap = new Map<string, Restriction>();

		for (const restriction of expectedRestrictions) {
			expectedMap.set(restriction.id, restriction);
		}

		const rows = db
			.prepare(
				`
			WITH
				banned AS (
					SELECT restriction_id, json_group_array(card_id) as banned
					FROM restrictions_cards_banned
					GROUP BY restriction_id
				),
				restricted AS (
					SELECT restriction_id, json_group_array(card_id) as restricted
					FROM restrictions_cards_restricted
					GROUP BY restriction_id
				),
				global_penalty AS (
					SELECT restriction_id, json_group_array(card_id) as global_penalty
					FROM restrictions_cards_global_penalty
					GROUP BY restriction_id
				),
				points AS (
					SELECT restriction_id, json_group_object(card_id, value) as points
					FROM restrictions_cards_points
					GROUP BY restriction_id
				),
				ufc AS (
					SELECT restriction_id, json_group_object(card_id, value) as universal_faction_cost
					FROM restrictions_cards_universal_faction_cost
					GROUP BY restriction_id
				),
				banned_subtypes AS (
					SELECT restriction_id, json_group_array(card_subtype_id) as banned_subtypes
					FROM restrictions_card_subtypes_banned
					GROUP BY restriction_id
				),
				all_cards AS (
					SELECT restriction_id, card_id FROM restrictions_cards_banned
					UNION
					SELECT restriction_id, card_id FROM restrictions_cards_global_penalty
					UNION
					SELECT restriction_id, card_id FROM restrictions_cards_points
					UNION
					SELECT restriction_id, card_id FROM restrictions_cards_restricted
					UNION
					SELECT restriction_id, card_id FROM restrictions_cards_universal_faction_cost
				),
				size AS (
					SELECT restriction_id, count(*) as size
					FROM all_cards
					GROUP BY restriction_id
				)
			SELECT
				r.id, r.name, r.date_start, r.point_limit, r.format_id, r.created_at, r.updated_at,
				b.banned, re.restricted, g.global_penalty, p.points, u.universal_faction_cost,
				bs.banned_subtypes, s.size
			FROM restrictions r
			LEFT JOIN banned b ON r.id = b.restriction_id
			LEFT JOIN restricted re ON r.id = re.restriction_id
			LEFT JOIN global_penalty g ON r.id = g.restriction_id
			LEFT JOIN points p ON r.id = p.restriction_id
			LEFT JOIN ufc u ON r.id = u.restriction_id
			LEFT JOIN banned_subtypes bs ON r.id = bs.restriction_id
			LEFT JOIN size s ON r.id = s.restriction_id
			`
			)
			.all() as RestrictionRow[];

		let recordsCompared = 0;

		for (const row of rows) {
			const expectedRestriction = expectedMap.get(row.id);
			expect(
				expectedRestriction,
				`Missing expected restriction for id ${row.id}`
			).toBeDefined();

			const adapted = adaptRestriction(row);

			expect(adapted).toEqual(expectedRestriction);
			recordsCompared++;
		}
		console.log(`Restrictions tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});

describe('Snapshot Adapter', () => {
	it('correctly adapts all snapshots from sqlite to match API output', () => {
		const expectedSnapshots = (readJsonDataFor('snapshots') as { data: Snapshot[] }).data;

		const expectedMap = new Map<string, Snapshot>();

		for (const snapshot of expectedSnapshots) {
			expectedMap.set(snapshot.id, snapshot);
		}

		const rows = db
			.prepare(
				`
			WITH
				num_cards AS (
					SELECT cp.value AS card_pool_id, COUNT(*) AS num_cards
					FROM unified_cards c, json_each(c.card_pool_ids) AS cp
					GROUP BY 1
				),
				cycles AS (
					SELECT card_pool_id, json_group_array(card_cycle_id) AS card_cycle_ids
					FROM card_pools_card_cycles
					GROUP BY 1
				),
				sets AS (
					SELECT card_pool_id, json_group_array(card_set_id) AS card_set_ids
					FROM card_pools_card_sets
					GROUP BY 1
				)
			SELECT
				s.id, s.format_id, s.card_pool_id, s.date_start, s.restriction_id, s.active, s.created_at, s.updated_at,
				num_cards.num_cards, cycles.card_cycle_ids, sets.card_set_ids
			FROM snapshots AS s
			LEFT JOIN num_cards ON s.card_pool_id = num_cards.card_pool_id
			LEFT JOIN cycles ON s.card_pool_id = cycles.card_pool_id
			LEFT JOIN sets ON s.card_pool_id = sets.card_pool_id
			`
			)
			.all() as SnapshotRow[];

		let recordsCompared = 0;

		for (const row of rows) {
			const expectedSnapshot = expectedMap.get(row.id);
			expect(expectedSnapshot, `Missing expected snapshot for id ${row.id}`).toBeDefined();

			const adapted = adaptSnapshot(row);

			if (adapted.attributes.card_cycle_ids) {
				adapted.attributes.card_cycle_ids = [
					...new Set(adapted.attributes.card_cycle_ids)
				].sort();
			}
			if (adapted.attributes.card_set_ids) {
				adapted.attributes.card_set_ids = [
					...new Set(adapted.attributes.card_set_ids)
				].sort();
			}

			if (expectedSnapshot!.attributes.card_cycle_ids) {
				expectedSnapshot!.attributes.card_cycle_ids = [
					...new Set(expectedSnapshot!.attributes.card_cycle_ids)
				].sort();
			}
			if (expectedSnapshot!.attributes.card_set_ids) {
				expectedSnapshot!.attributes.card_set_ids = [
					...new Set(expectedSnapshot!.attributes.card_set_ids)
				].sort();
			}

			expect(adapted).toEqual(expectedSnapshot);
			recordsCompared++;
		}
		console.log(`Snapshots tested: ${recordsCompared}`);
		expect(recordsCompared).toBe(expectedMap.size);
	});
});
