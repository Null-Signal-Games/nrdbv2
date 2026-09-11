import { describe, it, expect, beforeAll } from 'vitest';
import { buildCompletionTiers, getGhostRemainder, getWordRangeAtCursor } from './ghost';
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

describe('getGhostRemainder', () => {
	it('completes a card type', () => {
		expect(getGhostRemainder('eve', 3)).toBe('nt');
	});

	it('completes a faction', () => {
		expect(getGhostRemainder('sha', 3)).toBe('per');
	});

	it('completes a subtype', () => {
		expect(getGhostRemainder('iceb', 4)).toBe('reaker');
	});

	it('completes a boolean', () => {
		expect(getGhostRemainder('uni', 3)).toBe('que');
	});

	it('prefers earlier tiers when several match', () => {
		// "pro" matches card type "program" before any subtype.
		expect(getGhostRemainder('pro', 3)).toBe('gram');
	});

	it('returns empty for words shorter than two characters', () => {
		expect(getGhostRemainder('e', 1)).toBe('');
	});

	it('returns empty when the word is already complete', () => {
		expect(getGhostRemainder('event', 5)).toBe('');
	});

	it('returns empty when nothing matches', () => {
		expect(getGhostRemainder('zzz', 3)).toBe('');
	});

	it('only completes the word at the cursor', () => {
		// "event " has a trailing space; the word at the cursor is empty.
		expect(getGhostRemainder('event ', 6)).toBe('');
	});

	it('completes the whole word when the cursor sits inside it', () => {
		expect(getGhostRemainder('jin', 1)).toBe('teki');
		expect(getGhostRemainder('jin', 2)).toBe('teki');
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
