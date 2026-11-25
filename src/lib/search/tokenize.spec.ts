import { describe, it, expect } from 'vitest';
import { findLongestPhrase, tokenize, type Token } from './tokenize';

const texts = (input: string) => tokenize(input).map((token) => token.text);
const source = (input: string, token: Token) => input.slice(token.start, token.end);

describe('tokenize - words', () => {
	it('lowercases words and records where each came from', () => {
		const input = '  SHAPER   Consoles ';
		const tokens = tokenize(input);
		expect(tokens.map((token) => token.text)).toEqual(['shaper', 'consoles']);
		expect(tokens.map((token) => source(input, token))).toEqual(['SHAPER', 'Consoles']);
	});

	it('splits trailing punctuation into its own token', () => {
		const input = 'shaper, ice.';
		const tokens = tokenize(input);
		expect(tokens.map((token) => token.text)).toEqual(['shaper', ',', 'ice', '.']);
		expect(source(input, tokens[1])).toBe(',');
		expect(texts('a.b ...')).toEqual(['a.b', '...']);
	});
});

describe('tokenize - comparisons written in words', () => {
	it('merges a comparison phrase into one token covering the phrase', () => {
		const prefixed = 'cost greater than or equal to 3';
		const [, operator] = tokenize(prefixed);
		expect(operator.text).toBe('>=');
		expect(source(prefixed, operator)).toBe('greater than or equal to');

		const suffixed = '2 or more strength';
		const [comparison] = tokenize(suffixed);
		expect(comparison.text).toBe('>=2');
		expect(source(suffixed, comparison)).toBe('2 or more');
	});

	it('leaves "or more" alone without a number in front', () => {
		expect(texts('shaper or more')).toEqual(['shaper', 'or', 'more']);
	});
});

describe('tokenize - negation', () => {
	it('folds "not" into the next word only', () => {
		const input = 'not code gates';
		const tokens = tokenize(input);
		expect(tokens).toMatchObject([
			{ text: 'code', negated: true },
			{ text: 'gates', negated: false }
		]);
		expect(source(input, tokens[0])).toBe('not code');
	});

	it('folds "non-" into the word', () => {
		const input = 'ice non-shaper';
		const [, faction] = tokenize(input);
		expect(faction).toMatchObject({ text: 'shaper', negated: true });
		expect(source(input, faction)).toBe('non-shaper');
	});

	it('leaves "non", a bare "non-" and a trailing "not" as words', () => {
		expect(tokenize('non shaper non- shaper not')).toMatchObject([
			{ text: 'non', negated: false },
			{ text: 'shaper', negated: false },
			{ text: 'non-', negated: false },
			{ text: 'shaper', negated: false },
			{ text: 'not', negated: false }
		]);
	});

	it('does not negate a comparison or quoted syntax', () => {
		expect(tokenize('not more than 3')).toMatchObject([
			{ text: 'not', negated: false },
			{ text: '>', negated: false },
			{ text: '3', negated: false }
		]);
		expect(tokenize('not "end the run"')).toMatchObject([
			{ text: 'not', negated: false },
			{ text: '"end the run"', negated: false }
		]);
	});

	it('does not cancel "non-" with "not"', () => {
		expect(tokenize('not non-shaper')).toMatchObject([{ text: 'non-shaper', negated: true }]);
	});
});

describe('tokenize - quoted literal syntax', () => {
	it('keeps a quoted field term as typed and lowercases a bare quoted phrase', () => {
		expect(tokenize('x:"End the Run" "Sure Gamble"')).toMatchObject([
			{ text: 'x:"End the Run"', verbatim: true },
			{ text: '"sure gamble"', verbatim: true }
		]);
	});

	it('keeps a parenthesized group with quotes whole', () => {
		expect(texts('!(x:"tag" or x:"damage") ice')).toEqual(['!(x:"tag" or x:"damage")', 'ice']);

		const input = 'ice (x:"tag" or x:"damage")';
		const [, group] = tokenize(input);
		expect(group.verbatim).toBe(true);
		expect(source(input, group)).toBe('(x:"tag" or x:"damage")');
	});

	it('keeps tokens in input order around quoted syntax', () => {
		const input = 'ice x:"tag" or "net damage" sentry';
		const tokens = tokenize(input);
		expect(tokens.map((token) => token.text)).toEqual([
			'ice',
			'x:"tag"',
			'or',
			'"net damage"',
			'sentry'
		]);
		expect(source(input, tokens[3])).toBe('"net damage"');
	});
});

describe('findLongestPhrase', () => {
	const lookup = (phrase: string) =>
		({ 'code gate': 'two', code: 'one' })[phrase] as string | undefined;

	it('prefers the longest phrase starting at the position', () => {
		const tokens = tokenize('ice code gate');
		expect(findLongestPhrase(tokens, 1, 3, lookup)).toEqual({
			value: 'two',
			run: tokens.slice(1, 3)
		});
	});

	it('does not build a phrase across quoted syntax', () => {
		const tokens = tokenize('a "b" c');
		const anyPhrase = (phrase: string) => phrase;
		expect(findLongestPhrase(tokens, 0, 3, anyPhrase)?.run).toEqual(tokens.slice(0, 1));
		expect(findLongestPhrase(tokens, 1, 3, anyPhrase)).toBeNull();
	});

	it('allows a negated first word but not a negated later one', () => {
		expect(findLongestPhrase(tokenize('not code gate'), 0, 3, lookup)?.value).toBe('two');
		expect(findLongestPhrase(tokenize('code not gate'), 0, 3, lookup)?.value).toBe('one');
	});
});
