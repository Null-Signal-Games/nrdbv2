import type { Intent, StructuredIntent } from './intents';

const KIND_PRIORITY: Record<StructuredIntent['kind'], number> = {
	side: 0,
	faction: 1,
	type: 2,
	subtype: 3,
	set: 4,
	cycle: 5,
	agendaRatio: 6,
	numeric: 7,
	boolean: 8,
	semantic: 9,
	freeform: 10
};

interface OrGroupIntent {
	kind: 'or_group';
	members: StructuredIntent[];
	priority: number;
}

type AssemblyItem = StructuredIntent | OrGroupIntent;

function expandForOrGroup(intent: StructuredIntent): StructuredIntent[] {
	if (intent.kind === 'faction' && Array.isArray(intent.value) && !intent.negated) {
		return intent.value.map((value) => ({ kind: 'faction', value, negated: false }));
	}
	if (intent.kind === 'type' && Array.isArray(intent.value) && !intent.negated) {
		return intent.value.map((value) => ({ kind: 'type', value, negated: false }));
	}
	return [intent];
}

// A run of structured intents joined by single or_markers, starting at i.
// Stops at the first non-marker gap (or a doubled marker like "a or or b").
function collectOrChain(flat: Intent[], i: number): { members: StructuredIntent[]; next: number } {
	const members: StructuredIntent[] = [flat[i] as StructuredIntent];
	let j = i + 1;
	while (flat[j]?.kind === 'or_marker' && flat[j + 1] && flat[j + 1].kind !== 'or_marker') {
		members.push(flat[j + 1] as StructuredIntent);
		j += 2;
	}
	return { members, next: j };
}

function groupOrIntents(flat: Intent[]): AssemblyItem[] {
	const result: AssemblyItem[] = [];
	let i = 0;

	while (i < flat.length) {
		const cur = flat[i];

		if (cur.kind === 'or_marker') {
			i++; // orphaned marker, nothing to anchor it to
			continue;
		}

		const chain = collectOrChain(flat, i);
		if (chain.members.length > 1) {
			const members = chain.members.flatMap(expandForOrGroup);
			const priority = Math.min(...members.map((m) => KIND_PRIORITY[m.kind]));
			result.push({ kind: 'or_group', members, priority });
		} else {
			result.push(cur as StructuredIntent);
		}
		i = chain.next;
	}

	return result;
}

function arrayFieldStr(prefix: string, v: string | string[], negated: boolean): string {
	if (Array.isArray(v)) {
		// negated array must match none (AND): one negative token each
		return negated
			? v.map((x) => `${prefix}!${x}`).join(' ')
			: `(${v.map((x) => `${prefix}:${x}`).join(' or ')})`;
	}
	return negated ? `${prefix}!${v}` : `${prefix}:${v}`;
}

export function intentFilterStr(intent: StructuredIntent): string {
	switch (intent.kind) {
		case 'side':
			return intent.negated ? `d!${intent.value}` : `d:${intent.value}`;
		case 'faction':
			return arrayFieldStr('f', intent.value, intent.negated);
		case 'type':
			return arrayFieldStr('t', intent.value, intent.negated);
		case 'subtype':
			return intent.negated ? `s!${intent.value}` : `s:${intent.value}`;
		case 'set':
			return intent.negated ? `e!${intent.value}` : `e:${intent.value}`;
		case 'cycle':
			return intent.negated ? `c!${intent.value}` : `c:${intent.value}`;
		case 'numeric':
			return `${intent.field}${intent.op}${intent.value}`;
		case 'agendaRatio':
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

export function assembleOutput(intents: Intent[]): string {
	const grouped = groupOrIntents(intents);

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
			const memberStrs = item.members.map((m) => intentFilterStr(m));
			parts.push(`(${memberStrs.join(' or ')})`);
			continue;
		}
		parts.push(intentFilterStr(item));
	}

	parts.push(...freeformParts);

	return parts.join(' ');
}
