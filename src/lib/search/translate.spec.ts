import { describe, it, expect, beforeAll } from 'vitest';
import { interpretSearch } from './interpret';
import { translateToQuery } from './translate';
import { populateSubtypeMap } from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

// Exercises the full text -> SQL path the orchestrator runs: interpret then translate.
const build = (input: string, limit?: number) =>
	translateToQuery(interpretSearch(input), { limit });

const expectedSql = (where: string) =>
	`SELECT * FROM unified_cards WHERE ${where} ORDER BY title ASC`;

describe('translateToQuery (interpreted text -> SQL)', () => {
	it('compiles a plain word to a title LIKE search', () => {
		const result = build('corroder');
		expect(result.error).toBeNull();
		expect(result.sql).toBe(expectedSql('lower(unified_cards.stripped_title) LIKE ?'));
		expect(result.params).toEqual(['%corroder%']);
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
		expect(result.params).toEqual(['%shaper%', 'console']);
	});

	it('compiles a numeric comparison from words', () => {
		const result = build('cost more than 5');
		expect(result.error).toBeNull();
		expect(result.sql).toBe(expectedSql('unified_cards.cost > ?'));
		expect(result.params).toEqual(['5']);
	});

	it('returns every match when no limit is given', () => {
		const result = build('corroder');
		expect(result.error).toBeNull();
		expect(result.sql).not.toContain('LIMIT');
		expect(result.params).toEqual(['%corroder%']);
	});

	it('appends a limit clause when a limit is given', () => {
		const result = build('corroder', 25);
		expect(result.error).toBeNull();
		expect(result.sql).toBe(
			`${expectedSql('lower(unified_cards.stripped_title) LIKE ?')} LIMIT ?`
		);
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

describe('translateToQuery constraints', () => {
	const sideConstraint = { clause: 'unified_cards.side_id = ?', params: ['runner'] };

	it('ANDs the constraint onto the expression, expression parameters first', () => {
		const result = translateToQuery(interpretSearch('corroder'), {
			constraint: sideConstraint
		});
		expect(result.error).toBeNull();
		expect(result.sql).toBe(
			expectedSql(
				'(lower(unified_cards.stripped_title) LIKE ?) AND (unified_cards.side_id = ?)'
			)
		);
		expect(result.params).toEqual(['%corroder%', 'runner']);
	});

	it('selects a limited constrained result set when the query is blank', () => {
		const result = translateToQuery('', { constraint: sideConstraint, limit: 101 });
		expect(result.error).toBeNull();
		expect(result.sql).toBe(`${expectedSql('unified_cards.side_id = ?')} LIMIT ?`);
		expect(result.params).toEqual(['runner', 101]);
	});
});
