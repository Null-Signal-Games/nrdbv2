import { describe, test, expect } from 'vitest';
import {
	queryGrammar,
	CardSearchQueryBuilder,
	PrintingSearchQueryBuilder
} from './search_grammar_and_builder';

describe('Search Grammar and Builder', () => {
	test('parses a keyword', () => {
		const inputs = ['t'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'operand');
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('fails with non-keyword', () => {
		const inputs = ['...', '1'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'operand');
			expect(tree.failed()).toBe(true);
		}
	});

	test('parses an operator', () => {
		const inputs = [':', '!', '>', '<', '<=', '>='];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'operator');
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('fails with non-operator', () => {
		const inputs = ['a', '?', '&', '(', '-'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'operator');
			expect(tree.failed()).toBe(true);
		}
	});

	test('parses a simple value', () => {
		const inputs = ['a', 'weyland-consortium', '1', '01-01-1970'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'value');
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses a regex value', () => {
		const inputs = ['/^n/'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'value');
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses a quote value', () => {
		const inputs = [`"double"`, `'single'`, `"double quotes"`, `'single quotes'`];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'value');
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses combined values', () => {
		const inputs = ['a|b', 'a&b', '(a)', 'a|(b&c)', '(a&b)|(c&d)'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input, 'value');
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses a pair', () => {
		const keywords = ['a', 'b', 'c'];
		const operators = [':', '!', '>', '<', '<=', '>='];
		const values = ['a', '/.*[^ab]$/', `(a|b)&(c|' d ')`];
		for (const keyword of keywords) {
			for (const operator of operators) {
				for (const value of values) {
					const input = `${keyword}${operator}${value}`;
					const tree = queryGrammar.match(input, 'condition');
					expect(tree.succeeded()).toBe(true);
				}
			}
		}
	});

	test('parses a query', () => {
		const inputs = [`f:weyland-consortium t!"operation" n<=1`];
		for (const input of inputs) {
			const tree = queryGrammar.match(input);
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses a query and some words', () => {
		const inputs = [`a b test run f:weyland-consortium t!"operation" n<=1`];
		for (const input of inputs) {
			const tree = queryGrammar.match(input);
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses a bare string', () => {
		const inputs = [`hello-world`];
		for (const input of inputs) {
			const tree = queryGrammar.match(input);
			expect(tree.succeeded()).toBe(true);
		}
	});

	test('parses a quoted string', () => {
		const input = 'hello world';
		const tree = queryGrammar.match(input);
		expect(tree.succeeded()).toBe(true);
	});

	test('parses a query (root)', () => {
		const input = `f:weyland-consortium t!"operation" n<=1`;
		const tree = queryGrammar.match(input);
		expect(tree.succeeded()).toBe(true);
	});

	test('parses a bare word', () => {
		const input = ` siphon      `;
		const tree = queryGrammar.match(input);
		expect(tree.succeeded()).toBe(true);
	});

	test('parses a quoted word', () => {
		const input = ` "sure gamble"`;
		const tree = queryGrammar.match(input);
		expect(tree.succeeded()).toBe(true);
	});

	test('parses strings', () => {
		const input = ` "sure gamble"         diversion         `;
		const tree = queryGrammar.match(input);
		expect(tree.succeeded()).toBe(true);
	});

	test('parses a query and some words (root)', () => {
		const input = `"bean" f:weyland-consortium t!"operation"   royalties  n<=1 `;
		const tree = queryGrammar.match(input);
		expect(tree.succeeded()).toBe(true);
	});

	test('parses a string', () => {
		const inputs = [`sure gamble`, 'diversion'];
		for (const input of inputs) {
			const tree = queryGrammar.match(input);
			expect(tree.succeeded()).toBe(true);
		}
	});

	// CardSearchQueryBuilder Tests
	// Ported over fairly directly from the NRDB API tests for the parser and builder libraries.
	test('CardSearchQueryBuilder - simple successful query', () => {
		const builder = new CardSearchQueryBuilder('x:trash');
		expect(builder.parse_error).toBe(null);
		expect(builder.where).toBe('lower(unified_cards.stripped_text) LIKE ?');
		expect(builder.where_values).toEqual(['%trash%']);
		expect(builder.left_joins).toEqual([]);
	});

	test('CardSearchQueryBuilder - multiple terms', () => {
		const builder = new CardSearchQueryBuilder('x:trash cost:3');
		expect(builder.parse_error).toBe(null);
		expect(builder.where).toBe(
			'lower(unified_cards.stripped_text) LIKE ? AND unified_cards.cost = ?'
		);
		expect(builder.where_values).toEqual(['%trash%', '3']);
		expect(builder.left_joins).toEqual([]);
	});

	test('CardSearchQueryBuilder - numeric field not equal', () => {
		const builder = new CardSearchQueryBuilder('trash_cost!3');
		expect(builder.where).toBe('unified_cards.trash_cost != ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('CardSearchQueryBuilder - numeric field less than', () => {
		const builder = new CardSearchQueryBuilder('trash_cost<3');
		expect(builder.where).toBe('unified_cards.trash_cost < ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('CardSearchQueryBuilder - numeric field less than or equal to', () => {
		const builder = new CardSearchQueryBuilder('trash_cost<=3');
		expect(builder.where).toBe('unified_cards.trash_cost <= ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('CardSearchQueryBuilder - numeric field greater than', () => {
		const builder = new CardSearchQueryBuilder('trash_cost>3');
		expect(builder.where).toBe('unified_cards.trash_cost > ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('CardSearchQueryBuilder - numeric field greater than or equal to', () => {
		const builder = new CardSearchQueryBuilder('trash_cost>=3');
		expect(builder.where).toBe('unified_cards.trash_cost >= ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('CardSearchQueryBuilder - string field not like', () => {
		const builder = new CardSearchQueryBuilder('title!sure');
		expect(builder.where).toBe('lower(unified_cards.stripped_title) NOT LIKE ?');
		expect(builder.where_values).toEqual(['%sure%']);
	});

	test('CardSearchQueryBuilder - string field regex', () => {
		const builder = new CardSearchQueryBuilder('title:/^sure/');
		expect(builder.where).toBe('unified_cards.stripped_title REGEXP ?');
		expect(builder.where_values).toEqual(['^sure']);
	});

	test('CardSearchQueryBuilder - string field negated regex', () => {
		const builder = new CardSearchQueryBuilder('title!/^sure/');
		expect(builder.where).toBe('unified_cards.stripped_title NOT REGEXP ?');
		expect(builder.where_values).toEqual(['^sure']);
	});

	test('CardSearchQueryBuilder - bad boolean operators throws', () => {
		const ops = ['<', '<=', '>', '>='];
		for (const op of ops) {
			expect(() => {
				new CardSearchQueryBuilder(`is_unique${op}true`);
			}).toThrow(`Invalid boolean operator "${op}"`);
		}
	});

	test('CardSearchQueryBuilder - bad string operators throws', () => {
		const ops = ['<', '<=', '>', '>='];
		for (const op of ops) {
			expect(() => {
				new CardSearchQueryBuilder(`title${op}sure`);
			}).toThrow(`Invalid string operator "${op}"`);
		}
	});

	test('CardSearchQueryBuilder - bare word', () => {
		const builder = new CardSearchQueryBuilder('diversion');
		expect(builder.where).toBe('lower(unified_cards.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%diversion%']);
	});

	test('CardSearchQueryBuilder - bare word negated', () => {
		const builder = new CardSearchQueryBuilder('!diversion');
		expect(builder.where).toBe('NOT lower(unified_cards.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%diversion%']);
	});

	test('CardSearchQueryBuilder - quoted string negated', () => {
		const builder = new CardSearchQueryBuilder('!"diversion of funds"');
		expect(builder.where).toBe('NOT lower(unified_cards.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%diversion of funds%']);
	});

	test('CardSearchQueryBuilder - unicode in query', () => {
		const builder = new CardSearchQueryBuilder('"Chaos Theory: Wünderkind"');
		expect(builder.where).toBe('lower(unified_cards.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%chaos theory: wunderkind%']);
	});

	test('CardSearchQueryBuilder - unknown keyword throws', () => {
		expect(() => {
			new CardSearchQueryBuilder('asdfasdf:bleargh');
		}).toThrow('Unknown keyword asdfasdf');
	});

	test('CardSearchQueryBuilder - is_banned without restriction', () => {
		const builder = new CardSearchQueryBuilder('is_banned:true');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_banned) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true']);
	});

	test('CardSearchQueryBuilder - is_restricted without restriction', () => {
		const builder = new CardSearchQueryBuilder('is_restricted:true');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_restricted) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true']);
	});

	test('CardSearchQueryBuilder - has_global_penalty without restriction', () => {
		const builder = new CardSearchQueryBuilder('has_global_penalty:true');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_global_penalty) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true']);
	});

	test('CardSearchQueryBuilder - is_banned with restriction', () => {
		const builder = new CardSearchQueryBuilder('is_banned:true restriction_id:ban_list_foo');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_banned) WHERE value = ?) AND EXISTS (SELECT 1 FROM json_each(unified_cards.restriction_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true', 'ban_list_foo']);
	});

	test('CardSearchQueryBuilder - is_restricted with restriction', () => {
		const builder = new CardSearchQueryBuilder(
			'is_restricted:true restriction_id:ban_list_foo'
		);
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_restricted) WHERE value = ?) AND EXISTS (SELECT 1 FROM json_each(unified_cards.restriction_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true', 'ban_list_foo']);
	});

	test('CardSearchQueryBuilder - has_global_penalty with restriction', () => {
		const builder = new CardSearchQueryBuilder(
			'has_global_penalty:true restriction_id:ban_list_foo'
		);
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_global_penalty) WHERE value = ?) AND EXISTS (SELECT 1 FROM json_each(unified_cards.restriction_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true', 'ban_list_foo']);
	});

	test('CardSearchQueryBuilder - eternal_points', () => {
		const builder = new CardSearchQueryBuilder('eternal_points:eternal_restriction_id-3');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_points) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['eternal_restriction_id=3']);
	});

	test('CardSearchQueryBuilder - universal_faction_cost', () => {
		const builder = new CardSearchQueryBuilder('universal_faction_cost:3');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_universal_faction_cost) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['3']);
	});

	test('CardSearchQueryBuilder - card_pool', () => {
		const builder = new CardSearchQueryBuilder('card_pool:best_pool');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.card_pool_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['best_pool']);
	});

	test('CardSearchQueryBuilder - format_id', () => {
		const builder = new CardSearchQueryBuilder('format_id:best_format');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.format_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['best_format']);
	});

	test('CardSearchQueryBuilder - bad boolean value throws', () => {
		expect(() => {
			new CardSearchQueryBuilder('additional_cost:nah');
		}).toThrow('Invalid value "nah" for boolean field "additional_cost"');
	});

	test('CardSearchQueryBuilder - bad numeric value throws', () => {
		expect(() => {
			new CardSearchQueryBuilder('trash_cost:"too damn high"');
		}).toThrow('Invalid value "too damn high" for integer field "trash_cost"');
	});

	test('CardSearchQueryBuilder - bad format operator throws', () => {
		expect(() => {
			new CardSearchQueryBuilder('format!standard');
		}).toThrow('Invalid format operator "!"');
	});

	test('CardSearchQueryBuilder - standard format', () => {
		const builder = new CardSearchQueryBuilder('format:standard');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.snapshot_ids) WHERE value = (SELECT id FROM snapshots WHERE format_id = ? AND active)) ' +
				'AND NOT EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_banned) WHERE value = (SELECT restriction_id FROM snapshots WHERE format_id = ? AND active))'
		);
		expect(builder.where_values).toEqual(['standard', 'standard']);
	});

	test('CardSearchQueryBuilder - latest startup format', () => {
		const builder = new CardSearchQueryBuilder('format:startup-latest');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.snapshot_ids) WHERE value = (SELECT id FROM snapshots WHERE format_id = ? ORDER BY date_start DESC LIMIT 1)) ' +
				'AND NOT EXISTS (SELECT 1 FROM json_each(unified_cards.restrictions_banned) WHERE value = (SELECT restriction_id FROM snapshots WHERE format_id = ? ORDER BY date_start DESC LIMIT 1))'
		);
		expect(builder.where_values).toEqual(['startup', 'startup']);
	});

	// PrintingdSearchQueryBuilder Tests
	// Ported over fairly directly from the NRDB API tests for the parser and builder libraries.

	test('PrintingSearchQueryBuilder - simple successful query', () => {
		const builder = new PrintingSearchQueryBuilder('x:trash');
		expect(builder.parse_error).toBe(null);
		expect(builder.where).toBe('lower(unified_printings.stripped_text) LIKE ?');
		expect(builder.where_values).toEqual(['%trash%']);
		expect(builder.left_joins).toEqual([]);
	});

	test('PrintingSearchQueryBuilder - multiple terms', () => {
		const builder = new PrintingSearchQueryBuilder('x:trash cost:3');
		expect(builder.parse_error).toBe(null);
		expect(builder.where).toBe(
			'lower(unified_printings.stripped_text) LIKE ? AND unified_printings.cost = ?'
		);
		expect(builder.where_values).toEqual(['%trash%', '3']);
		expect(builder.left_joins).toEqual([]);
	});

	test('PrintingSearchQueryBuilder - numeric field not equal', () => {
		const builder = new PrintingSearchQueryBuilder('trash_cost!3');
		expect(builder.where).toBe('unified_printings.trash_cost != ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('PrintingSearchQueryBuilder - numeric field less than', () => {
		const builder = new PrintingSearchQueryBuilder('trash_cost<3');
		expect(builder.where).toBe('unified_printings.trash_cost < ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('PrintingSearchQueryBuilder - numeric field less than or equal to', () => {
		const builder = new PrintingSearchQueryBuilder('trash_cost<=3');
		expect(builder.where).toBe('unified_printings.trash_cost <= ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('PrintingSearchQueryBuilder - numeric field greater than', () => {
		const builder = new PrintingSearchQueryBuilder('trash_cost>3');
		expect(builder.where).toBe('unified_printings.trash_cost > ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('PrintingSearchQueryBuilder - numeric field greater than or equal to', () => {
		const builder = new PrintingSearchQueryBuilder('trash_cost>=3');
		expect(builder.where).toBe('unified_printings.trash_cost >= ?');
		expect(builder.where_values).toEqual(['3']);
	});

	test('PrintingSearchQueryBuilder - string field not like', () => {
		const builder = new PrintingSearchQueryBuilder('title!sure');
		expect(builder.where).toBe('lower(unified_printings.stripped_title) NOT LIKE ?');
		expect(builder.where_values).toEqual(['%sure%']);
	});

	test('PrintingSearchQueryBuilder - bad boolean operators throws', () => {
		const ops = ['<', '<=', '>', '>='];
		for (const op of ops) {
			expect(() => {
				new PrintingSearchQueryBuilder(`is_unique${op}true`);
			}).toThrow(`Invalid boolean operator "${op}"`);
		}
	});

	test('PrintingSearchQueryBuilder - bad string operators throws', () => {
		const ops = ['<', '<=', '>', '>='];
		for (const op of ops) {
			expect(() => {
				new PrintingSearchQueryBuilder(`title${op}sure`);
			}).toThrow(`Invalid string operator "${op}"`);
		}
	});

	test('PrintingSearchQueryBuilder - bare word', () => {
		const builder = new PrintingSearchQueryBuilder('diversion');
		expect(builder.where).toBe('lower(unified_printings.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%diversion%']);
	});

	test('PrintingSearchQueryBuilder - bare word negated', () => {
		const builder = new PrintingSearchQueryBuilder('!diversion');
		expect(builder.where).toBe('NOT lower(unified_printings.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%diversion%']);
	});

	test('PrintingSearchQueryBuilder - quoted string negated', () => {
		const builder = new PrintingSearchQueryBuilder('!"diversion of funds"');
		expect(builder.where).toBe('NOT lower(unified_printings.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%diversion of funds%']);
	});

	test('PrintingSearchQueryBuilder - unicode in query', () => {
		const builder = new PrintingSearchQueryBuilder('"Chaos Theory: Wünderkind"');
		expect(builder.where).toBe('lower(unified_printings.stripped_title) LIKE ?');
		expect(builder.where_values).toEqual(['%chaos theory: wunderkind%']);
	});

	test('PrintingSearchQueryBuilder - unknown keyword throws', () => {
		expect(() => {
			new PrintingSearchQueryBuilder('asdfasdf:bleargh');
		}).toThrow('Unknown keyword asdfasdf');
	});

	test('PrintingSearchQueryBuilder - is_banned without restriction', () => {
		const builder = new PrintingSearchQueryBuilder('is_banned:true');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_banned) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true']);
	});

	test('PrintingSearchQueryBuilder - is_restricted without restriction', () => {
		const builder = new PrintingSearchQueryBuilder('is_restricted:true');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_restricted) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true']);
	});

	test('PrintingSearchQueryBuilder - has_global_penalty without restriction', () => {
		const builder = new PrintingSearchQueryBuilder('has_global_penalty:true');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_global_penalty) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true']);
	});

	test('PrintingSearchQueryBuilder - is_banned with restriction', () => {
		const builder = new PrintingSearchQueryBuilder(
			'is_banned:true restriction_id:ban_list_foo'
		);
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_banned) WHERE value = ?) AND EXISTS (SELECT 1 FROM json_each(unified_printings.restriction_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true', 'ban_list_foo']);
	});

	test('PrintingSearchQueryBuilder - is_restricted with restriction', () => {
		const builder = new PrintingSearchQueryBuilder(
			'is_restricted:true restriction_id:ban_list_foo'
		);
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_restricted) WHERE value = ?) AND EXISTS (SELECT 1 FROM json_each(unified_printings.restriction_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true', 'ban_list_foo']);
	});

	test('PrintingSearchQueryBuilder - has_global_penalty with restriction', () => {
		const builder = new PrintingSearchQueryBuilder(
			'has_global_penalty:true restriction_id:ban_list_foo'
		);
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_global_penalty) WHERE value = ?) AND EXISTS (SELECT 1 FROM json_each(unified_printings.restriction_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['true', 'ban_list_foo']);
	});

	test('PrintingSearchQueryBuilder - eternal_points', () => {
		const builder = new PrintingSearchQueryBuilder('eternal_points:eternal_restriction_id-3');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_points) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['eternal_restriction_id=3']);
	});

	test('PrintingSearchQueryBuilder - universal_faction_cost', () => {
		const builder = new PrintingSearchQueryBuilder('universal_faction_cost:3');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.restrictions_universal_faction_cost) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['3']);
	});

	test('PrintingSearchQueryBuilder - card_pool', () => {
		const builder = new PrintingSearchQueryBuilder('card_pool:best_pool');
		expect(builder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.card_pool_ids) WHERE value = ?)'
		);
		expect(builder.where_values).toEqual(['best_pool']);
	});

	test('PrintingSearchQueryBuilder - bad boolean value throws', () => {
		expect(() => {
			new PrintingSearchQueryBuilder('additional_cost:nah');
		}).toThrow('Invalid value "nah" for boolean field "additional_cost"');
	});

	test('PrintingSearchQueryBuilder - bad numeric value throws', () => {
		expect(() => {
			new PrintingSearchQueryBuilder('trash_cost:"too damn high"');
		}).toThrow('Invalid value "too damn high" for integer field "trash_cost"');
	});

	test('PrintingSearchQueryBuilder - release_date full', () => {
		const builder = new PrintingSearchQueryBuilder('release_date:2022-07-22');
		expect(builder.where).toBe('unified_printings.date_release = ?');
		expect(builder.where_values).toEqual(['2022-07-22']);
	});

	test('PrintingSearchQueryBuilder - release_date short', () => {
		const builder = new PrintingSearchQueryBuilder('r>=20220722');
		expect(builder.where).toBe('unified_printings.date_release >= ?');
		expect(builder.where_values).toEqual(['20220722']);
	});

	test('PrintingSearchQueryBuilder - bad date value throws', () => {
		expect(() => {
			new PrintingSearchQueryBuilder('release_date:Jul-22-2022');
		}).toThrow(
			'Invalid value "jul-22-2022" for date field "release_date" - only YYYY-MM-DD or YYYYMMDD are supported.'
		);
	});

	test('PrintingSearchQueryBuilder - illustrator full', () => {
		const builder = new PrintingSearchQueryBuilder('illustrator:Zeilinger');
		expect(builder.where).toBe('lower(unified_printings.display_illustrators) LIKE ?');
		expect(builder.where_values).toEqual(['%zeilinger%']);
	});

	test('PrintingSearchQueryBuilder - illustrator short', () => {
		const builder = new PrintingSearchQueryBuilder('i!Zeilinger');
		expect(builder.where).toBe('lower(unified_printings.display_illustrators) NOT LIKE ?');
		expect(builder.where_values).toEqual(['%zeilinger%']);
	});

	test('Card & Printing - designed_by', () => {
		const cardBuilder = new CardSearchQueryBuilder('designed_by:best_org');
		expect(cardBuilder.where.trim()).toBe('lower(unified_cards.designed_by) LIKE ?');
		expect(cardBuilder.where_values).toEqual(['%best_org%']);

		const printBuilder = new PrintingSearchQueryBuilder('designed_by:best_org');
		expect(printBuilder.where.trim()).toBe('lower(unified_printings.designed_by) LIKE ?');
		expect(printBuilder.where_values).toEqual(['%best_org%']);
	});

	test('PrintingSearchQueryBuilder - released_by', () => {
		const builder = new PrintingSearchQueryBuilder('released_by:best_org');
		expect(builder.where.trim()).toBe('lower(unified_printings.released_by) LIKE ?');
		expect(builder.where_values).toEqual(['%best_org%']);
	});

	test('Card & Printing - printings_released_by', () => {
		const cardBuilder = new CardSearchQueryBuilder('printings_released_by:best_org');
		expect(cardBuilder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_cards.printings_released_by) WHERE value = ?)'
		);
		expect(cardBuilder.where_values).toEqual(['best_org']);

		const printBuilder = new PrintingSearchQueryBuilder('printings_released_by:best_org');
		expect(printBuilder.where.trim()).toBe(
			'EXISTS (SELECT 1 FROM json_each(unified_printings.printings_released_by) WHERE value = ?)'
		);
		expect(printBuilder.where_values).toEqual(['best_org']);
	});
});
