import type { CardTypeIds, FactionIds } from '$lib/types';

export interface SideIntent {
	kind: 'side';
	value: string;
	negated: boolean;
}
export interface FactionIntent {
	kind: 'faction';
	value: FactionIds | FactionIds[];
	negated: boolean;
}
export interface TypeIntent {
	kind: 'type';
	value: CardTypeIds | CardTypeIds[];
	negated: boolean;
}
export interface SubtypeIntent {
	kind: 'subtype';
	value: string;
	negated: boolean;
}
export interface SetIntent {
	kind: 'set';
	value: string;
	negated: boolean;
}
export interface CycleIntent {
	kind: 'cycle';
	value: string;
	negated: boolean;
}
export interface NumericIntent {
	kind: 'numeric';
	field: string;
	op: string;
	value: number;
}
export interface AgendaRatioIntent {
	kind: 'agendaRatio';
	advancement: number;
	points: number;
}
export interface BooleanIntent {
	kind: 'boolean';
	field: string;
	value: 0 | 1;
}
export interface SemanticIntent {
	kind: 'semantic';
	tokens: string[];
}
export interface FreeformIntent {
	kind: 'freeform';
	word: string;
}

export interface OrMarkerIntent {
	kind: 'or_marker';
}

export type Intent =
	| SideIntent
	| FactionIntent
	| TypeIntent
	| SubtypeIntent
	| SetIntent
	| CycleIntent
	| NumericIntent
	| AgendaRatioIntent
	| BooleanIntent
	| SemanticIntent
	| FreeformIntent
	| OrMarkerIntent;

export type StructuredIntent = Exclude<Intent, OrMarkerIntent>;

export interface IntentMatch {
	intent: Intent;
	phrase: string;
}
