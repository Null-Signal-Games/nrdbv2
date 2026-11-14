import {
	type IntentMatch,
	type SemanticIntent,
	normalizeInput,
	extractNumericIntents,
	recognizeIntents,
	assembleOutput
} from './intents';
import { RE_QUOTED_TERM } from './patterns';

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

export interface Interpretation {
	input: string;
	expression: string;
	// In input order.
	matches: IntentMatch[];
}

// Interpret typed input as an NRDB search expression.
export function interpret(input: string): Interpretation {
	const { remainder, terms } = extractQuotedTerms(input);
	const normalized = normalizeInput(remainder);
	const { intents: numericIntents, remainder: afterNumeric } = extractNumericIntents(normalized);
	const matches = recognizeIntents(afterNumeric).map((match) => {
		const { intent } = match;
		if (intent.kind === 'freeform') {
			const placeholder = RE_PLACEHOLDER.exec(intent.word);
			if (placeholder) return { ...match, intent: terms[Number(placeholder[1])] };
		}
		return match;
	});
	const expression = assembleOutput([...numericIntents, ...matches.map(({ intent }) => intent)]);
	return { input, expression, matches };
}
