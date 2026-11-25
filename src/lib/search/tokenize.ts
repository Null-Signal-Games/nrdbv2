import { RE_QUOTED_GROUP, RE_QUOTED_TERM, RE_TRAILING_PUNCTUATION } from './patterns';

export interface Token {
	text: string;
	start: number;
	end: number;
	negated: boolean;
	verbatim: boolean;
}

export function tokenize(input: string): Token[] {
	return applyNegation(scan(input));
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
