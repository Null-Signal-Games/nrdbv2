import { describe, it, expect, beforeAll } from 'vitest';
import { buildCompletionTiers, getCompletionRemainder, getWordRangeAtCursor } from './completion';
import { populateSubtypeMap } from './vocabulary';
import { SUBTYPE_FIXTURE } from './subtypes.fixture';

beforeAll(() => populateSubtypeMap(SUBTYPE_FIXTURE));

describe('buildCompletionTiers', () => {
	it('builds five tiers in priority order', () => {
		const tiers = buildCompletionTiers();
		expect(tiers).toHaveLength(5);
	});

	it('includes card types in the first tier', () => {
		const [cardTypes] = buildCompletionTiers();
		expect(cardTypes).toContain('event');
		expect(cardTypes).toContain('hardware');
		expect(cardTypes).toContain('program');
	});

	it('includes factions in the second tier', () => {
		const [, factions] = buildCompletionTiers();
		expect(factions).toContain('shaper');
		expect(factions).toContain('anarch');
	});

	it('puts the subtype priority entry first and sorts the rest', () => {
		const [, , subtypes] = buildCompletionTiers();
		expect(subtypes[0]).toBe('sentry');
		const rest = subtypes.slice(1);
		expect(rest).toEqual([...rest].sort());
		expect(rest).toContain('barrier');
		expect(rest).toContain('icebreaker');
	});

	it('excludes hyphenated keys and the blocklist', () => {
		const [, factions] = buildCompletionTiers();
		expect(factions).not.toContain('weyland consortium');
		for (const tier of buildCompletionTiers()) {
			expect(tier.every((k) => !k.includes('-'))).toBe(true);
		}
	});

	it('drops plural variants when the singular exists', () => {
		const [cardTypes] = buildCompletionTiers();
		expect(cardTypes).toContain('event');
		expect(cardTypes).not.toContain('events');
	});

	it('memoizes tiers until the subtype map changes', () => {
		const first = buildCompletionTiers();
		expect(buildCompletionTiers()).toBe(first);
	});
});

describe('getCompletionRemainder', () => {
	it('completes a card type', () => {
		expect(getCompletionRemainder('eve', 3)).toBe('nt');
	});

	it('completes a faction', () => {
		expect(getCompletionRemainder('sha', 3)).toBe('per');
	});

	it('completes a subtype', () => {
		expect(getCompletionRemainder('iceb', 4)).toBe('reaker');
	});

	it('completes a boolean', () => {
		expect(getCompletionRemainder('uni', 3)).toBe('que');
	});

	it('prefers earlier tiers when several match', () => {
		// "co" matches the card type "corp identity" and subtypes like "code gate".
		expect(getCompletionRemainder('co', 2)).toBe('rp identity');
	});

	it('returns empty for words shorter than two characters', () => {
		expect(getCompletionRemainder('e', 1)).toBe('');
	});

	it('returns empty when the word is already complete', () => {
		expect(getCompletionRemainder('event', 5)).toBe('');
	});

	it('returns empty when nothing matches', () => {
		expect(getCompletionRemainder('zzz', 3)).toBe('');
	});

	it('only completes the word at the cursor', () => {
		expect(getCompletionRemainder('event ', 6)).toBe('');
	});

	it('completes the whole word when the cursor sits inside it', () => {
		expect(getCompletionRemainder('jin', 1)).toBe('teki');
		expect(getCompletionRemainder('jin', 2)).toBe('teki');
	});
});

describe('getWordRangeAtCursor', () => {
	it('spans the word containing the cursor', () => {
		expect(getWordRangeAtCursor('jin', 1)).toEqual({ start: 0, end: 3 });
		expect(getWordRangeAtCursor('jin x:draw', 1)).toEqual({ start: 0, end: 3 });
	});

	it('ends at the cursor when it sits at the end of the text', () => {
		expect(getWordRangeAtCursor('event ', 6)).toEqual({ start: 6, end: 6 });
	});
});
