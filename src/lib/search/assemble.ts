import type { Intent, IntentOrConnective } from './intents';

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
	semantic: 9,
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

export function writeIntent(intent: Intent): string {
	switch (intent.kind) {
		case 'side':
			return intent.negated ? `d!${intent.value}` : `d:${intent.value}`;
		case 'faction':
			return valueTerms('f', intent.value, intent.negated);
		case 'card_type':
			return valueTerms('t', intent.value, intent.negated);
		case 'subtype':
			return intent.negated ? `s!${intent.value}` : `s:${intent.value}`;
		case 'set':
			return intent.negated ? `e!${intent.value}` : `e:${intent.value}`;
		case 'cycle':
			return intent.negated ? `c!${intent.value}` : `c:${intent.value}`;
		case 'numeric':
			return `${intent.field}${intent.operator}${intent.value}`;
		case 'agenda_ratio':
			return `g:${intent.advancement} v:${intent.points}`;
		case 'boolean':
			return `${intent.field}:${intent.value}`;
		case 'semantic':
			return intent.tokens.join(' ');
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
