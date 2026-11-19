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
export interface CardTypeIntent {
	kind: 'card_type';
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
	operator: string;
	value: number;
}
export interface AgendaRatioIntent {
	kind: 'agenda_ratio';
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

export type Intent =
	| SideIntent
	| FactionIntent
	| CardTypeIntent
	| SubtypeIntent
	| SetIntent
	| CycleIntent
	| NumericIntent
	| AgendaRatioIntent
	| BooleanIntent
	| SemanticIntent
	| FreeformIntent;

// The word "or" between two intents. Intents without one between them are ANDed.
export interface Connective {
	kind: 'or';
}

export type IntentOrConnective = Intent | Connective;

export interface IntentMatch {
	intent: IntentOrConnective;
	phrase: string;
}
