import type { IntentMatch } from './intents';
import {
	extractQuotedTerms,
	normalizeInput,
	extractNumericIntents,
	recognizeIntents,
	restoreQuotedTerms
} from './recognize';
import { assembleOutput } from './assemble';

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
	const matches = restoreQuotedTerms(recognizeIntents(afterNumeric), terms);
	const expression = assembleOutput([...numericIntents, ...matches.map(({ intent }) => intent)]);
	return { input, expression, matches };
}
