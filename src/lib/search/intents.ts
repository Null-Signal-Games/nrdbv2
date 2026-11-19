import type { CardTypeIds, FactionIds } from '$lib/types';

// An intent is one thing the typed input asks for, in domain terms.

// Named as the search grammar names them.
export type NumericField =
	| 'advancement_cost'
	| 'agenda_points'
	| 'base_link'
	| 'cost'
	| 'influence_cost'
	| 'memory_usage'
	| 'num_printed_subroutines'
	| 'strength'
	| 'trash_cost';

// Named as the search grammar names them.
export type BooleanField =
	| 'additional_cost'
	| 'advanceable'
	| 'gains_subroutines'
	| 'interrupt'
	| 'is_unique'
	| 'on_encounter_effect'
	| 'performs_trace'
	| 'trash_ability';

export type ComparisonOperator = '=' | '<' | '<=' | '>' | '>=';

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
// The value is the subtype's lowercased name.
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
	field: NumericField;
	operator: ComparisonOperator;
	value: number;
}
export interface AgendaRatioIntent {
	kind: 'agenda_ratio';
	advancement: number;
	points: number;
}
export interface BooleanIntent {
	kind: 'boolean';
	field: BooleanField;
	negated: boolean;
}
// Card text containing every one of the phrases.
export interface TextIntent {
	kind: 'text';
	phrases: string[];
}
// Literal search syntax, passed through untouched.
export interface VerbatimIntent {
	kind: 'verbatim';
	expression: string;
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
	| TextIntent
	| VerbatimIntent
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
