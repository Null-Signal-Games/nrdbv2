import {
	RE_NUMBER,
	RE_OPERATOR,
	RE_QUOTED_GROUP,
	RE_QUOTED_TERM,
	RE_TRAILING_PUNCTUATION
} from './patterns';
import { COMPARISON_PREFIX_MAP, COMPARISON_SUFFIX_MAP, maxWordsIn } from './vocabulary';

export interface Token {
	text: string;
	start: number;
	end: number;
	negated: boolean;
	verbatim: boolean;
}

export function tokenize(input: string): Token[] {
	return applyNegation(mergeComparisons(scan(input)));
}

export function findLongestPhrase<V>(
	tokens: Token[],
	startIndex: number,
	maxWords: number,
	lookupPhrase: (phrase: string) => V | undefined
): { value: V; run: Token[] } | null {
	for (let length = Math.min(maxWords, tokens.length - startIndex); length >= 1; length--) {
		const run = tokens.slice(startIndex, startIndex + length);
		if (run.some((token, index) => token.verbatim || (index > 0 && token.negated))) continue;
		const value = lookupPhrase(run.map((token) => token.text).join(' '));
		if (value !== undefined) return { value, run };
	}
	return null;
}

function scan(input: string): Token[] {
	const tokens: Token[] = [];
	let rest = input;
	const takeVerbatim = (pattern: RegExp, textOf: (match: RegExpExecArray) => string) => {
		for (const match of rest.matchAll(pattern)) {
			tokens.push({
				text: textOf(match),
				start: match.index,
				end: match.index + match[0].length,
				negated: false,
				verbatim: true
			});
		}
		rest = rest.replace(pattern, (match) => ' '.repeat(match.length));
	};

	takeVerbatim(RE_QUOTED_GROUP, (match) => match[0]);
	takeVerbatim(RE_QUOTED_TERM, ([term, prefix, phrase]) =>
		prefix ? term : `"${phrase.toLowerCase()}"`
	);

	for (const match of rest.matchAll(/\S+/g)) {
		const [text] = match;
		const start = match.index;
		const body = text.replace(RE_TRAILING_PUNCTUATION, '') || text;
		tokens.push({
			text: body.toLowerCase(),
			start,
			end: start + body.length,
			negated: false,
			verbatim: false
		});
		if (body !== text) {
			tokens.push({
				text: text.slice(body.length),
				start: start + body.length,
				end: start + text.length,
				negated: false,
				verbatim: false
			});
		}
	}

	return tokens.sort((a, b) => a.start - b.start);
}

const MAX_COMPARISON_PREFIX_WORDS = maxWordsIn(COMPARISON_PREFIX_MAP);
const MAX_COMPARISON_SUFFIX_WORDS = maxWordsIn(COMPARISON_SUFFIX_MAP);

interface RunReplacement {
	run: Token[];
	text: string;
}

function mergeComparisons(tokens: Token[]): Token[] {
	const withOperators = mergeRuns(tokens, findPrefixOperator);
	const withPrefixed = mergeRuns(withOperators, findPrefixedComparison);
	return mergeRuns(withPrefixed, findSuffixedComparison);
}

function findPrefixOperator(tokens: Token[], i: number): RunReplacement | null {
	const phrase = findLongestPhrase(tokens, i, MAX_COMPARISON_PREFIX_WORDS, (text) =>
		COMPARISON_PREFIX_MAP.get(text)
	);
	return phrase && { run: phrase.run, text: phrase.value };
}

function findSuffixedComparison(tokens: Token[], i: number): RunReplacement | null {
	const number = tokens[i];
	if (!isNumber(number)) return null;
	const suffix = findLongestPhrase(tokens, i + 1, MAX_COMPARISON_SUFFIX_WORDS, (text) =>
		COMPARISON_SUFFIX_MAP.get(text)
	);
	return suffix && { run: [number, ...suffix.run], text: `${suffix.value}${number.text}` };
}

function findPrefixedComparison(tokens: Token[], i: number): RunReplacement | null {
	const operator = tokens[i];
	const number = tokens[i + 1];
	if (!isOperator(operator) || !number || !isNumber(number)) return null;
	return { run: [operator, number], text: `${operator.text}${number.text}` };
}

function mergeRuns(
	tokens: Token[],
	findRun: (tokens: Token[], i: number) => RunReplacement | null
): Token[] {
	const merged: Token[] = [];
	for (let i = 0; i < tokens.length;) {
		const found = findRun(tokens, i);
		if (found) {
			const { run, text } = found;
			merged.push({
				text,
				start: run[0].start,
				end: run[run.length - 1].end,
				negated: false,
				verbatim: false
			});
			i += run.length;
		} else {
			merged.push(tokens[i++]);
		}
	}
	return merged;
}

function isOperator(token: Token): boolean {
	return !token.verbatim && RE_OPERATOR.test(token.text);
}

function isNumber(token: Token): boolean {
	return !token.verbatim && RE_NUMBER.test(token.text);
}

function isNegatable(token: Token): boolean {
	return !token.verbatim && /^\w/.test(token.text);
}

function applyNegation(tokens: Token[]): Token[] {
	const result: Token[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const next = tokens[i + 1];
		if (!token.verbatim && token.text === 'not' && next && isNegatable(next)) {
			result.push({ ...next, start: token.start, negated: true });
			i++;
		} else {
			result.push(stripNonPrefix(token));
		}
	}
	return result;
}

function stripNonPrefix(token: Token): Token {
	if (token.verbatim || !/^non-\w/.test(token.text)) return token;
	return { ...token, text: token.text.slice('non-'.length), negated: true };
}
