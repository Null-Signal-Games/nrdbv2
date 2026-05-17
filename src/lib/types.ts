import type { Card } from './api.types';

export type SidesIds = 'corp' | 'runner';

export type Publishers = 'null_signal_games' | 'fantasy_flight_games';

export type Formats = 'eternal' | 'ram' | 'snapshot' | 'standard' | 'startup' | 'system_gateway';

export type FileFormat = 'json' | 'txt' | 'otcgn' | 'bbcode' | 'md' | 'jinteki.net';

export type CardTypeIds =
	| 'agenda'
	| 'asset'
	| 'corp_identity'
	| 'event'
	| 'hardware'
	| 'ice'
	| 'operation'
	| 'program'
	| 'resource'
	| 'runner_identity'
	| 'upgrade';

// TODO: get all available subtypes
export type CardSubTypeIds = 'fracter' | 'icebreaker';

export type FactionIds =
	| 'anarch'
	| 'criminal'
	| 'shaper'
	| 'adam'
	| 'apex'
	| 'sunny_lebeau'
	| 'haas_bioroid'
	| 'jinteki'
	| 'nbn'
	| 'weyland_consortium'
	| 'neutral_corp'
	| 'neutral_runner';

export interface CardGroup {
	type: CardTypeIds;
	data: Card[];
}
