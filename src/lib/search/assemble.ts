import type { BooleanField, Intent, IntentOrConnective, NumericField } from './intents';

// Assembly writes intents out as an NRDB search expression. This is the only step that
// knows the search syntax: field keywords, operators, quoting and grouping.

const KIND_KEYWORD = {
	side: 'd',
	faction: 'f',
	card_type: 't',
	subtype: 's',
	set: 'e',
	cycle: 'c',
	text: 'x'
} as const;

// Short keywords for numeric and boolean fields. A field missing here is written by name.
const SHORT_KEYWORD: Partial<Record<NumericField | BooleanField, string>> = {
	advancement_cost: 'g',
	agenda_points: 'v',
	base_link: 'l',
	cost: 'o',
	influence_cost: 'n',
	is_unique: 'u',
	memory_usage: 'm',
	strength: 'p',
	trash_cost: 'h'
};

function fieldKeyword(field: NumericField | BooleanField): string {
	return SHORT_KEYWORD[field] ?? field;
}

const KIND_PRIORITY: Record<Intent['kind'], number> = {
	side: 0,
	faction: 1,
	card_type: 2,
	subtype: 3,
	set: 4,
	cycle: 5,
	agenda_ratio: 6,
	numeric: 7,
	boolean: 8,
	text: 9,
	verbatim: 9,
	freeform: 10
};

interface OrGroup {
	kind: 'or_group';
	members: Intent[];
	priority: number;
}

type AssemblyItem = Intent | OrGroup;

// Inside an or-group an any-of intent becomes one member per value, so the group stays flat.
function expandForOrGroup(intent: Intent): Intent[] {
	if (intent.kind === 'faction' && Array.isArray(intent.value) && !intent.negated) {
		return intent.value.map((value) => ({ kind: 'faction', value, negated: false }));
	}
	if (intent.kind === 'card_type' && Array.isArray(intent.value) && !intent.negated) {
		return intent.value.map((value) => ({ kind: 'card_type', value, negated: false }));
	}
	return [intent];
}

// A run of intents joined by single connectives, starting at i.
// Stops at the first gap without one (or a doubled connective like "a or or b").
function collectOrChain(
	items: IntentOrConnective[],
	i: number
): { members: Intent[]; next: number } {
	const members: Intent[] = [items[i] as Intent];
	let j = i + 1;
	while (items[j]?.kind === 'or' && items[j + 1] && items[j + 1].kind !== 'or') {
		members.push(items[j + 1] as Intent);
		j += 2;
	}
	return { members, next: j };
}

function groupOrChains(items: IntentOrConnective[]): AssemblyItem[] {
	const result: AssemblyItem[] = [];
	let i = 0;

	while (i < items.length) {
		const cur = items[i];

		if (cur.kind === 'or') {
			i++; // orphaned connective, nothing to anchor it to
			continue;
		}

		const chain = collectOrChain(items, i);
		if (chain.members.length > 1) {
			const members = chain.members.flatMap(expandForOrGroup);
			const priority = Math.min(...members.map((m) => KIND_PRIORITY[m.kind]));
			result.push({ kind: 'or_group', members, priority });
		} else {
			result.push(cur);
		}
		i = chain.next;
	}

	return result;
}

function valueTerms(prefix: string, v: string | string[], negated: boolean): string {
	if (Array.isArray(v)) {
		// negated array must match none (AND): one negative token each
		return negated
			? v.map((x) => `${prefix}!${x}`).join(' ')
			: `(${v.map((x) => `${prefix}:${x}`).join(' or ')})`;
	}
	return negated ? `${prefix}!${v}` : `${prefix}:${v}`;
}

function quote(value: string): string {
	return /[\s-]/.test(value) ? `"${value}"` : value;
}

export function writeIntent(intent: Intent): string {
	switch (intent.kind) {
		case 'side':
		case 'faction':
		case 'card_type':
		case 'set':
		case 'cycle':
			return valueTerms(KIND_KEYWORD[intent.kind], intent.value, intent.negated);
		case 'subtype':
			return valueTerms(KIND_KEYWORD.subtype, quote(intent.value), intent.negated);
		case 'boolean':
			return `${fieldKeyword(intent.field)}:${intent.negated ? 0 : 1}`;
		case 'numeric': {
			const operator = intent.operator === '=' ? ':' : intent.operator;
			return `${fieldKeyword(intent.field)}${operator}${intent.value}`;
		}
		case 'agenda_ratio':
			return [
				`${fieldKeyword('advancement_cost')}:${intent.advancement}`,
				`${fieldKeyword('agenda_points')}:${intent.points}`
			].join(' ');
		case 'text':
			return intent.phrases.map((phrase) => `${KIND_KEYWORD.text}:"${phrase}"`).join(' ');
		case 'verbatim':
			return intent.expression;
		case 'freeform':
			// bare word: matched against both title and text
			return intent.word;
	}
}

// Writes the expression for intents given in input order: or-chains become parenthesized
// groups, everything is sorted by kind, and freeform words go last.
export function assembleExpression(intents: IntentOrConnective[]): string {
	const grouped = groupOrChains(intents);

	const sorted = grouped
		.map((item, idx) => ({ item, idx }))
		.sort((a, b) => {
			const pa = a.item.kind === 'or_group' ? a.item.priority : KIND_PRIORITY[a.item.kind];
			const pb = b.item.kind === 'or_group' ? b.item.priority : KIND_PRIORITY[b.item.kind];
			return pa !== pb ? pa - pb : a.idx - b.idx;
		})
		.map(({ item }) => item);

	const parts: string[] = [];
	const freeformParts: string[] = [];

	for (const item of sorted) {
		if (item.kind === 'freeform') {
			freeformParts.push(item.word);
			continue;
		}
		if (item.kind === 'or_group') {
			const memberStrs = item.members.map((m) => writeIntent(m));
			parts.push(`(${memberStrs.join(' or ')})`);
			continue;
		}
		parts.push(writeIntent(item));
	}

	parts.push(...freeformParts);

	return parts.join(' ');
}
