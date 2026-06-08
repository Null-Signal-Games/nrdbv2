import { describe, it, expect, beforeAll } from 'vitest';
import { interpretSearch } from './interpret';
import { translateToQuery } from './translate';
import { populateSubtypeMap } from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

// Exercises the full text -> SQL path the orchestrator runs: interpret then translate.
const build = (input: string, limit?: number) => translateToQuery(interpretSearch(input), limit);

const expectedSql = (where: string) =>
	`SELECT * FROM unified_cards WHERE ${where} ORDER BY title ASC LIMIT ?`;

describe('translateToQuery (interpreted text -> SQL)', () => {
	it('compiles a plain word to a title LIKE search', () => {
		const result = build('corroder');
		expect(result.error).toBeNull();
		expect(result.sql).toBe(expectedSql('lower(unified_cards.stripped_title) LIKE ?'));
		expect(result.params).toEqual(['%corroder%', 5]);
	});

	it('compiles a structured natural-language query (faction + subtype)', () => {
		const result = build('shaper consoles');
		expect(result.error).toBeNull();
		expect(result.sql).toBe(
			expectedSql(
				'lower(unified_cards.faction_id) LIKE ? ' +
					'AND EXISTS (SELECT 1 FROM json_each(unified_cards.lower_card_subtype_names) WHERE value = ?)'
			)
		);
		expect(result.params).toEqual(['%shaper%', 'console', 5]);
	});

	it('compiles a numeric comparison from words', () => {
		const result = build('cost more than 5');
		expect(result.error).toBeNull();
		expect(result.sql).toBe(expectedSql('unified_cards.cost > ?'));
		expect(result.params).toEqual(['5', 5]);
	});

	it('honors a custom limit', () => {
		const result = build('corroder', 25);
		expect(result.params).toEqual(['%corroder%', 25]);
	});

	it('returns null sql for empty input', () => {
		const result = build('');
		expect(result.sql).toBeNull();
		expect(result.params).toEqual([]);
		expect(result.error).toBeNull();
	});

	it('returns null sql for whitespace-only input', () => {
		const result = build('   ');
		expect(result.sql).toBeNull();
		expect(result.error).toBeNull();
	});

	it('surfaces an unknown-keyword compile error without throwing', () => {
		const result = build('zzz:foo');
		expect(result.sql).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
		expect(result.error?.message).toContain('zzz');
	});
});
