import { buildNumericFieldPattern } from './vocabulary';

export const RE_GTE_WORDS = /\bgreater than or equal to\b/g;
export const RE_LTE_WORDS = /\bless than or equal to\b/g;
export const RE_AT_LEAST = /\bat least\b/g;
export const RE_AT_MOST = /\bat most\b/g;
export const RE_GT_WORDS = /\bgreater than\b/g;
export const RE_MORE_THAN = /\bmore than\b/g;
export const RE_LT_WORDS = /\bless than\b/g;
export const RE_FEWER_THAN = /\bfewer than\b/g;
export const RE_N_OR_MORE = /\b(\d+)\s+or\s+more\b/g;
export const RE_N_OR_FEWER = /\b(\d+)\s+or\s+(?:fewer|less)\b/g;
export const RE_NON_HYPHEN = /\bnon-(\w)/g;
export const RE_NOT_WORD = /\bnot\s+(\w)/g;

export const RE_AGENDA_RATIO = /\b(\d+)\/(\d+)s?\b/g;

const NUMERIC_FIELD_PATTERN = buildNumericFieldPattern();
export const RE_COMPOUND_OR_FIELD_AT_END = new RegExp(
	`([<>]=?)\\s*(\\d+)\\s+or\\s+([<>]=?)\\s*(\\d+)\\s+(${NUMERIC_FIELD_PATTERN})\\b`,
	'gi'
);
export const RE_COMPOUND_OR_FIELD_AT_START = new RegExp(
	`\\b(${NUMERIC_FIELD_PATTERN})\\s+([<>]=?)\\s*(\\d+)\\s+or\\s+([<>]=?)\\s*(\\d+)`,
	'gi'
);
export const RE_SINGLE_FIELD_AT_END = new RegExp(
	`([<>]=?)\\s*(\\d+)\\s+(${NUMERIC_FIELD_PATTERN})\\b`,
	'gi'
);
export const RE_SINGLE_FIELD_AT_START = new RegExp(
	`\\b(${NUMERIC_FIELD_PATTERN})\\s+([<>]=?)\\s*(\\d+)`,
	'gi'
);
export const RE_BARE_NUMBER_OR_FIELD = new RegExp(
	`\\b(\\d+)\\s+or\\s+(\\d+)\\s+(${NUMERIC_FIELD_PATTERN})\\b`,
	'gi'
);
export const RE_BARE_NUMBER_FIELD = new RegExp(`\\b(\\d+)\\s+(${NUMERIC_FIELD_PATTERN})\\b`, 'gi');

// A quoted phrase, optionally preceded by an explicit field/operator prefix
// (e.g. x:"end the run", s!"virus"). Group 1 is the prefix when present (the quote is
// part of explicit NRDB syntax); when absent the quote is a bare title/text phrase.
// Group 2 is the quoted value.
export const RE_QUOTED_TERM = /([A-Za-z_]+(?:<=|>=|[:!<>]))?"([^"]+)"/g;
