import { describe, it, expect, beforeAll } from 'vitest';
import { interpretSearch } from './interpret';
import { buildQuery } from './translate';
import { populateSubtypeMap } from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

// Pins the interpreted output (snapshot) AND proves that output is valid input for
// the query builder, not just an unchanged string. buildQuery feeds the expression
// to CardSearchQueryBuilder, so an interpretation the grammar rejects fails here
// even if the snapshot still matches.
function expectTransform(input: string, expected: string) {
	const expression = interpretSearch(input);
	expect(expression).toBe(expected);
	const { sql, error } = buildQuery(expression);
	expect(error).toBeNull();
	expect(sql).not.toBeNull();
}

// Characterization tests pinning interpretSearch output for a set of
// representative natural-language inputs. Token ordering is not significant:
// the NRDB API ANDs all conditions, so reordered tokens are equivalent.
describe('interpretSearch - representative queries', () => {
	it('shaper consoles', () => {
		expectTransform('shaper consoles', 'f:shaper s:console');
	});

	it('sentries less than 2 or more than 5 strength', () => {
		expectTransform('sentries less than 2 or more than 5 strength', 's:sentry (p<2 or p>5)');
	});

	it('ids', () => {
		expectTransform('ids', '(t:corp_identity or t:runner_identity)');
	});

	it('startup ids', () => {
		expectTransform('startup ids', '(t:corp_identity or t:runner_identity) startup');
	});

	it('code gates rez cost more than 5', () => {
		expectTransform('code gates rez cost more than 5', 's:"code gate" o>5');
	});

	it('ids once per turn', () => {
		expectTransform(
			'ids once per turn',
			'(t:corp_identity or t:runner_identity) x:"once per turn"'
		);
	});

	it('0 cost runner', () => {
		expectTransform('0 cost runner', 'd:runner o:0');
	});

	it('shaper hardware', () => {
		expectTransform('shaper hardware', 'f:shaper t:hardware');
	});

	it('weyland assets', () => {
		expectTransform('weyland assets', 'f:weyland_consortium t:asset');
	});

	it('non-anarch virus', () => {
		expectTransform('non-anarch virus', 'f!anarch s:virus');
	});

	it('grid upgrades', () => {
		expectTransform('grid upgrades', 't:upgrade grid');
	});

	it('executive assets', () => {
		expectTransform('executive assets', 't:asset s:executive');
	});

	it('shaper run events', () => {
		expectTransform('shaper run events', 'f:shaper t:event s:run');
	});

	it('operations place advancement counters', () => {
		expectTransform(
			'operations place advancement counters',
			't:operation x:"advancement counter"'
		);
	});

	it('runner identities', () => {
		expectTransform('runner identities', 't:runner_identity');
	});

	it('hb 5/3s', () => {
		expectTransform('hb 5/3s', 'f:haas_bioroid g:5 v:3');
	});

	it('companions', () => {
		expectTransform('companions', 's:companion');
	});

	it('mestnichestvo', () => {
		expectTransform('mestnichestvo', 'mestnichestvo');
	});

	it('ice gives tags', () => {
		expectTransform('ice gives tags', 't:ice x:"tag"');
	});

	it('non-unique connections', () => {
		expectTransform('non-unique connections', 's:connection u:0');
	});

	it('ice runner lose credits', () => {
		expectTransform('ice runner lose credits', 'd:runner t:ice x:"lose" x:"credit"');
	});

	it('corp trash abilities', () => {
		expectTransform('corp trash abilities', 'd:corp trash_ability:1');
	});
});

describe('interpretSearch - numeric or-more patterns', () => {
	it('N or more strength', () => {
		expectTransform('sentries 2 or more strength', 's:sentry p>=2');
	});

	it('N or fewer strength', () => {
		expectTransform('ice 3 or fewer strength', 't:ice p<=3');
	});

	it('N or less cost', () => {
		expectTransform('runner events 3 or less cost', 'd:runner t:event o<=3');
	});

	it('does not confuse with regular or between tokens', () => {
		expectTransform('shaper or criminal', '(f:shaper or f:criminal)');
	});
});

describe('interpretSearch - or handling', () => {
	it('two factions joined by or', () => {
		expectTransform('shaper or criminal events', '(f:shaper or f:criminal) t:event');
	});

	it('two subtypes joined by or', () => {
		expectTransform('sentries or code gates', '(s:sentry or s:"code gate")');
	});

	it('two types joined by or', () => {
		expectTransform('events or hardware', '(t:event or t:hardware)');
	});

	it('three-way or', () => {
		expectTransform(
			'shaper or anarch or criminal events',
			'(f:shaper or f:anarch or f:criminal) t:event'
		);
	});

	it('or with additional and-ed filter', () => {
		expectTransform('criminal or shaper ice', '(f:criminal or f:shaper) t:ice');
	});

	it('cross-kind or', () => {
		expectTransform('ice or assets', '(t:ice or t:asset)');
	});
});

describe('interpretSearch - explicit NRDB syntax (quoted field values)', () => {
	it('preserves a quoted card-text field query', () => {
		expectTransform('x:"end the run"', 'x:"end the run"');
	});

	it('preserves a quoted subtype field query', () => {
		expectTransform('s:"code gate"', 's:"code gate"');
	});

	it('preserves a quoted title field query', () => {
		expectTransform('title:"sure gamble"', 'title:"sure gamble"');
	});

	it('keeps an explicit field query intact alongside natural language', () => {
		expectTransform('shaper x:"end the run"', 'f:shaper x:"end the run"');
	});

	it('still treats a bare quoted phrase as a semantic search', () => {
		expectTransform('"end the run"', '"end the run"');
	});

	it('preserves OR between two quoted field terms', () => {
		expectTransform('x:"tag" or x:"damage"', '(x:"tag" or x:"damage")');
	});

	it('preserves OR between a quoted field term and a natural-language token', () => {
		expectTransform('x:"tag" or shaper', '(x:"tag" or f:shaper)');
	});

	it('preserves OR between two bare quoted phrases', () => {
		expectTransform('"tag" or "damage"', '("tag" or "damage")');
	});

	it('preserves parenthesized OR between two quoted field terms', () => {
		expectTransform('(x:"tag" or x:"damage")', '(x:"tag" or x:"damage")');
	});

	it('preserves negated parenthesized OR between two quoted field terms', () => {
		expectTransform('!(x:"tag" or x:"damage")', '!(x:"tag" or x:"damage")');
	});

	it('keeps parenthesized explicit OR intact alongside natural language', () => {
		expectTransform('shaper (x:"tag" or x:"damage")', 'f:shaper (x:"tag" or x:"damage")');
	});
});

describe('interpretSearch - additional cases', () => {
	it('single word card name search passes through unchanged', () => {
		expectTransform('corroder', 'corroder');
	});

	it('standard as freeform', () => {
		expectTransform('standard runner events', 'd:runner t:event standard');
	});

	it('negation with not keyword', () => {
		expectTransform('not shaper hardware', 'f!shaper t:hardware');
	});

	it('hb alias', () => {
		expectTransform('hb ice', 'f:haas_bioroid t:ice');
	});

	it('corp identities', () => {
		expectTransform('corp identities', 't:corp_identity');
	});

	it('unique programs', () => {
		expectTransform('unique programs', 't:program u:1');
	});

	it('non-unique resources', () => {
		expectTransform('non-unique resources', 't:resource u:0');
	});

	it('agenda ratio without s suffix', () => {
		expectTransform('jinteki 4/2', 'f:jinteki g:4 v:2');
	});

	it('barrier ice', () => {
		expectTransform('barrier ice', 't:ice s:barrier');
	});

	it('anarch icebreakers', () => {
		expectTransform('anarch icebreakers', 'f:anarch s:icebreaker');
	});
});
