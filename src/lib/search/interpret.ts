import {
	type Intent,
	type SemanticIntent,
	normalizeInput,
	extractNumericIntents,
	recognizeIntents,
	assembleOutput
} from './intents';
import { RE_QUOTED_TERM } from './patterns';

export { NEUTRAL_FACTION_OR_QUERY } from './intents';

// A quoted term swapped out for a positional placeholder. The placeholder is delimited by
// NULL so it survives lowercasing/normalization and the numeric pre-pass untouched, and is a
// single whitespace-free token so recognizeIntents keeps it whole. Restoring it in place
// (rather than extracting and re-appending) preserves its position relative to `or` - pulling
// quoted terms out would orphan the or-marker and turn `x:"tag" or x:"damage"` into an AND.
// oxlint-disable-next-line no-control-regex -- NULL is an intentional, collision-proof delimiter
const RE_PLACEHOLDER = /^\x00(\d+)\x00$/;
const RE_QUOTED_GROUP = /!?\([^()]*"[^"]+"[^()]*\)/g;

function pushTerm(terms: SemanticIntent[], token: string): string {
	const i = terms.length;
	terms.push({ kind: 'semantic', tokens: [token] });
	return ` \x00${i}\x00 `;
}

function extractQuotedTerms(input: string): { remainder: string; terms: SemanticIntent[] } {
	const terms: SemanticIntent[] = [];
	const withQuotedGroups = input.replace(RE_QUOTED_GROUP, (match) => pushTerm(terms, match));
	const remainder = withQuotedGroups.replace(
		RE_QUOTED_TERM,
		(match, prefix: string | undefined, phrase: string) => {
			// Explicit field/operator syntax (x:"...") passes through verbatim; a bare quoted
			// string (no field prefix) becomes a title/text search.
			return pushTerm(terms, prefix ? match : `"${phrase.toLowerCase()}"`);
		}
	);
	return { remainder, terms };
}

function runStages(input: string): { numericRaw: Intent[]; tokenRaw: Intent[] } {
	const { remainder, terms } = extractQuotedTerms(input);
	const normalized = normalizeInput(remainder);
	const { intents: numericRaw, remainder: afterNumeric } = extractNumericIntents(normalized);
	// Restore each placeholder to its quoted-term intent, in place, so the or-grouping in
	// assembleOutput sees the original token order.
	const tokenRaw = recognizeIntents(afterNumeric).map((intent) => {
		if (intent.kind === 'freeform') {
			const m = RE_PLACEHOLDER.exec(intent.word);
			if (m) return terms[Number(m[1])];
		}
		return intent;
	});
	return { numericRaw, tokenRaw };
}

export function interpretSearch(input: string): string {
	const { numericRaw, tokenRaw } = runStages(input);
	return assembleOutput([...numericRaw, ...tokenRaw]);
}
