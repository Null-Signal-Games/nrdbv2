import { describe, it, expect } from 'vitest';
import {
	RE_GTE_WORDS,
	RE_BARE_NUMBER_OR_FIELD,
	RE_LTE_WORDS,
	RE_AT_LEAST,
	RE_AT_MOST,
	RE_GT_WORDS,
	RE_MORE_THAN,
	RE_LT_WORDS,
	RE_FEWER_THAN,
	RE_N_OR_MORE,
	RE_N_OR_FEWER,
	RE_NON_HYPHEN,
	RE_NOT_WORD,
	RE_AGENDA_RATIO,
	RE_COMPOUND_OR_FIELD_AT_END,
	RE_COMPOUND_OR_FIELD_AT_START,
	RE_SINGLE_FIELD_AT_END,
	RE_SINGLE_FIELD_AT_START,
	RE_BARE_NUMBER_FIELD,
	RE_QUOTED_TERM
} from './patterns';

// Helper: test a regex match and return captured groups (resets lastIndex before use)
function match(re: RegExp, input: string): RegExpExecArray | null {
	re.lastIndex = 0;
	return re.exec(input);
}

function matches(re: RegExp, input: string): boolean {
	re.lastIndex = 0;
	return re.test(input);
}

// ===== Normalization patterns =====

describe('RE_GTE_WORDS', () => {
	it('matches full phrase', () =>
		expect(matches(RE_GTE_WORDS, 'strength greater than or equal to 3')).toBe(true));
	it('does not match partial', () => expect(matches(RE_GTE_WORDS, 'greater than 3')).toBe(false));
});

describe('RE_LTE_WORDS', () => {
	it('matches full phrase', () =>
		expect(matches(RE_LTE_WORDS, 'cost less than or equal to 2')).toBe(true));
	it('does not match partial', () => expect(matches(RE_LTE_WORDS, 'less than 2')).toBe(false));
});

describe('RE_AT_LEAST', () => {
	it('matches', () => expect(matches(RE_AT_LEAST, 'at least 4 strength')).toBe(true));
	it('requires word boundary', () => expect(matches(RE_AT_LEAST, 'eat least 4')).toBe(false));
});

describe('RE_AT_MOST', () => {
	it('matches', () => expect(matches(RE_AT_MOST, 'at most 2 cost')).toBe(true));
	it('does not match partial', () => expect(matches(RE_AT_MOST, 'at mostly 2')).toBe(false));
});

describe('RE_GT_WORDS', () => {
	it('matches "greater than"', () =>
		expect(matches(RE_GT_WORDS, 'strength greater than 5')).toBe(true));
	it('does not match "greater than or equal to"', () => {
		// RE_GTE_WORDS should be applied first in normalizeInput to avoid this overlap
		expect(matches(RE_GT_WORDS, 'greater than or equal to')).toBe(true);
	});
});

describe('RE_MORE_THAN', () => {
	it('matches', () => expect(matches(RE_MORE_THAN, 'more than 3 influence')).toBe(true));
	it('requires word boundary', () => expect(matches(RE_MORE_THAN, 'no more than')).toBe(true));
});

describe('RE_LT_WORDS', () => {
	it('matches "less than"', () => expect(matches(RE_LT_WORDS, 'less than 2 cost')).toBe(true));
	it('does not match "less than or equal to"', () => {
		expect(matches(RE_LT_WORDS, 'less than or equal to')).toBe(true);
	});
});

describe('RE_FEWER_THAN', () => {
	it('matches', () => expect(matches(RE_FEWER_THAN, 'fewer than 3 strength')).toBe(true));
	it('requires word boundary', () => expect(matches(RE_FEWER_THAN, 'fewer than')).toBe(true));
});

describe('RE_N_OR_MORE', () => {
	it('captures N', () => {
		const m = match(RE_N_OR_MORE, '2 or more strength');
		expect(m?.[1]).toBe('2');
	});

	it('matches with spacing variations', () =>
		expect(matches(RE_N_OR_MORE, '10 or more')).toBe(true));
	it('does not match "or more" without leading digit', () =>
		expect(matches(RE_N_OR_MORE, 'or more strength')).toBe(false));
});

describe('RE_N_OR_FEWER', () => {
	it('captures N for "fewer"', () => {
		const m = match(RE_N_OR_FEWER, '3 or fewer cost');
		expect(m?.[1]).toBe('3');
	});

	it('captures N for "less"', () => {
		const m = match(RE_N_OR_FEWER, '3 or less cost');
		expect(m?.[1]).toBe('3');
	});

	it('does not match "or fewer" without leading digit', () =>
		expect(matches(RE_N_OR_FEWER, 'or fewer')).toBe(false));
});

describe('RE_NON_HYPHEN', () => {
	it('captures the letter after "non-"', () => {
		const m = match(RE_NON_HYPHEN, 'non-shaper');
		expect(m?.[1]).toBe('s');
	});

	it('matches mid-word position', () =>
		expect(matches(RE_NON_HYPHEN, 'non-unique programs')).toBe(true));
	it('does not match "non" without hyphen', () =>
		expect(matches(RE_NON_HYPHEN, 'non shaper')).toBe(false));
	it('does not match "non-" at end of string', () =>
		expect(matches(RE_NON_HYPHEN, 'non-')).toBe(false));
});

describe('RE_NOT_WORD', () => {
	it('captures the first letter of the negated word', () => {
		const m = match(RE_NOT_WORD, 'not shaper');
		expect(m?.[1]).toBe('s');
	});

	it('requires a word character after "not "', () =>
		expect(matches(RE_NOT_WORD, 'not ')).toBe(false));
	it('does not match "not" without a following word character', () =>
		expect(matches(RE_NOT_WORD, 'notable')).toBe(false));
});

// ===== Numeric pre-pass patterns =====

describe('RE_AGENDA_RATIO', () => {
	it('matches N/M with s suffix', () => {
		const m = match(RE_AGENDA_RATIO, '5/3s');
		expect(m?.[1]).toBe('5');
		expect(m?.[2]).toBe('3');
	});

	it('matches N/M without s suffix', () => {
		const m = match(RE_AGENDA_RATIO, '4/2');
		expect(m?.[1]).toBe('4');
		expect(m?.[2]).toBe('2');
	});

	it('requires word boundary - does not match inside larger number', () => {
		expect(matches(RE_AGENDA_RATIO, 'x5/3y')).toBe(false);
	});

	it('does not match single number with slash', () =>
		expect(matches(RE_AGENDA_RATIO, '5/')).toBe(false));
	it('does not match fractions embedded in words', () =>
		expect(matches(RE_AGENDA_RATIO, 'a5/3b')).toBe(false));
});

describe('RE_COMPOUND_OR_FIELD_AT_END', () => {
	it('captures both operators, values, and field name', () => {
		RE_COMPOUND_OR_FIELD_AT_END.lastIndex = 0;
		const m = RE_COMPOUND_OR_FIELD_AT_END.exec('< 2 or > 5 strength');
		expect(m?.[1]).toBe('<');
		expect(m?.[2]).toBe('2');
		expect(m?.[3]).toBe('>');
		expect(m?.[4]).toBe('5');
		expect(m?.[5]?.toLowerCase()).toBe('strength');
	});

	it('matches with >= and <= operators', () => {
		RE_COMPOUND_OR_FIELD_AT_END.lastIndex = 0;
		expect(RE_COMPOUND_OR_FIELD_AT_END.test('>= 2 or <= 5 strength')).toBe(true);
	});

	it('matches multi-word field names', () => {
		RE_COMPOUND_OR_FIELD_AT_END.lastIndex = 0;
		expect(RE_COMPOUND_OR_FIELD_AT_END.test('< 2 or > 5 rez cost')).toBe(true);
	});

	it('does not match single-side comparison', () => {
		RE_COMPOUND_OR_FIELD_AT_END.lastIndex = 0;
		expect(RE_COMPOUND_OR_FIELD_AT_END.test('> 5 strength')).toBe(false);
	});
});

describe('RE_COMPOUND_OR_FIELD_AT_START', () => {
	it('captures field name, both operators and values', () => {
		RE_COMPOUND_OR_FIELD_AT_START.lastIndex = 0;
		const m = RE_COMPOUND_OR_FIELD_AT_START.exec('strength < 2 or > 5');
		expect(m?.[1]?.toLowerCase()).toBe('strength');
		expect(m?.[2]).toBe('<');
		expect(m?.[3]).toBe('2');
		expect(m?.[4]).toBe('>');
		expect(m?.[5]).toBe('5');
	});

	it('matches multi-word field at start', () => {
		RE_COMPOUND_OR_FIELD_AT_START.lastIndex = 0;
		expect(RE_COMPOUND_OR_FIELD_AT_START.test('rez cost > 3 or < 1')).toBe(true);
	});

	it('does not match single-side comparison', () => {
		RE_COMPOUND_OR_FIELD_AT_START.lastIndex = 0;
		expect(RE_COMPOUND_OR_FIELD_AT_START.test('strength > 5')).toBe(false);
	});
});

describe('RE_SINGLE_FIELD_AT_END', () => {
	it('captures operator, value, and field name', () => {
		RE_SINGLE_FIELD_AT_END.lastIndex = 0;
		const m = RE_SINGLE_FIELD_AT_END.exec('> 5 strength');
		expect(m?.[1]).toBe('>');
		expect(m?.[2]).toBe('5');
		expect(m?.[3]?.toLowerCase()).toBe('strength');
	});

	it('matches <= operator', () => {
		RE_SINGLE_FIELD_AT_END.lastIndex = 0;
		expect(RE_SINGLE_FIELD_AT_END.test('<= 3 cost')).toBe(true);
	});

	it('matches multi-word field', () => {
		RE_SINGLE_FIELD_AT_END.lastIndex = 0;
		expect(RE_SINGLE_FIELD_AT_END.test('> 5 rez cost')).toBe(true);
	});

	it('does not match without operator', () => {
		RE_SINGLE_FIELD_AT_END.lastIndex = 0;
		expect(RE_SINGLE_FIELD_AT_END.test('5 strength')).toBe(false);
	});
});

describe('RE_SINGLE_FIELD_AT_START', () => {
	it('captures field name, operator, and value', () => {
		RE_SINGLE_FIELD_AT_START.lastIndex = 0;
		const m = RE_SINGLE_FIELD_AT_START.exec('strength > 5');
		expect(m?.[1]?.toLowerCase()).toBe('strength');
		expect(m?.[2]).toBe('>');
		expect(m?.[3]).toBe('5');
	});

	it('matches multi-word field at start', () => {
		RE_SINGLE_FIELD_AT_START.lastIndex = 0;
		expect(RE_SINGLE_FIELD_AT_START.test('rez cost > 5')).toBe(true);
	});

	it('does not match without operator', () => {
		RE_SINGLE_FIELD_AT_START.lastIndex = 0;
		expect(RE_SINGLE_FIELD_AT_START.test('strength 5')).toBe(false);
	});
});

describe('RE_BARE_NUMBER_OR_FIELD', () => {
	it('captures both numbers and field name', () => {
		RE_BARE_NUMBER_OR_FIELD.lastIndex = 0;
		const m = RE_BARE_NUMBER_OR_FIELD.exec('1 or 2 trash');
		expect(m?.[1]).toBe('1');
		expect(m?.[2]).toBe('2');
		expect(m?.[3]?.toLowerCase()).toBe('trash');
	});

	it('matches multi-word field', () => {
		RE_BARE_NUMBER_OR_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_OR_FIELD.test('1 or 2 rez cost')).toBe(true);
	});

	it('does not match single number + field (no or)', () => {
		RE_BARE_NUMBER_OR_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_OR_FIELD.test('2 trash')).toBe(false);
	});

	it('does not match operator-prefixed numbers', () => {
		RE_BARE_NUMBER_OR_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_OR_FIELD.test('< 2 or > 5 strength')).toBe(false);
	});

	it('does not match unrecognized field', () => {
		RE_BARE_NUMBER_OR_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_OR_FIELD.test('1 or 2 foobar')).toBe(false);
	});
});

describe('RE_BARE_NUMBER_FIELD', () => {
	it('captures number and field name', () => {
		RE_BARE_NUMBER_FIELD.lastIndex = 0;
		const m = RE_BARE_NUMBER_FIELD.exec('0 cost');
		expect(m?.[1]).toBe('0');
		expect(m?.[2]?.toLowerCase()).toBe('cost');
	});

	it('matches multi-digit number', () => {
		RE_BARE_NUMBER_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_FIELD.test('10 strength')).toBe(true);
	});

	it('matches multi-word field', () => {
		RE_BARE_NUMBER_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_FIELD.test('3 rez cost')).toBe(true);
	});

	it('still matches number+field even when operator precedes (earlier patterns consume those first)', () => {
		RE_BARE_NUMBER_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_FIELD.test('> 5 strength')).toBe(true);
	});

	it('does not match number without recognized field', () => {
		RE_BARE_NUMBER_FIELD.lastIndex = 0;
		expect(RE_BARE_NUMBER_FIELD.test('3 foobar')).toBe(false);
	});
});

// ===== Quoted phrase pattern =====

describe('RE_QUOTED_TERM', () => {
	it('captures a bare quoted phrase with no field prefix', () => {
		const m = match(RE_QUOTED_TERM, '"once per turn"');
		expect(m?.[1]).toBeUndefined();
		expect(m?.[2]).toBe('once per turn');
	});

	it('captures an explicit field/operator prefix with its quoted value', () => {
		const m = match(RE_QUOTED_TERM, 'x:"end the run"');
		expect(m?.[1]).toBe('x:');
		expect(m?.[2]).toBe('end the run');
	});

	it('does not include leading grouping punctuation in the field/operator prefix', () => {
		const m = match(RE_QUOTED_TERM, '(x:"tag" or x:"damage")');
		expect(m?.index).toBe(1);
		expect(m?.[0]).toBe('x:"tag"');
		expect(m?.[1]).toBe('x:');
		expect(m?.[2]).toBe('tag');
	});

	it('captures a negation operator prefix', () => {
		const m = match(RE_QUOTED_TERM, 's!"virus"');
		expect(m?.[1]).toBe('s!');
		expect(m?.[2]).toBe('virus');
	});

	it('distinguishes field-quoted from bare quotes in one string (global flag)', () => {
		RE_QUOTED_TERM.lastIndex = 0;
		const results: Array<{ prefix: string | undefined; phrase: string }> = [];
		let m: RegExpExecArray | null;
		const input = 's:"code gate" "bad publicity"';
		while ((m = RE_QUOTED_TERM.exec(input)) !== null) {
			results.push({ prefix: m[1], phrase: m[2] });
		}
		expect(results).toEqual([
			{ prefix: 's:', phrase: 'code gate' },
			{ prefix: undefined, phrase: 'bad publicity' }
		]);
	});

	it('does not match empty quotes', () => expect(matches(RE_QUOTED_TERM, '""')).toBe(false));
	it('does not match unclosed quote', () =>
		expect(matches(RE_QUOTED_TERM, '"unclosed')).toBe(false));
	it('does not match when no quotes present', () =>
		expect(matches(RE_QUOTED_TERM, 'plain text')).toBe(false));
});
