import { m } from './paraglide/messages.js';
import type { FactionIds, CardTypeIds, Publishers } from './types.js';

export const factions: Record<FactionIds, string> = {
	anarch: m.anarch(),
	criminal: m.criminal(),
	shaper: m.shaper(),
	adam: m.adam(),
	apex: m.apex(),
	sunny_lebeau: m.sunny_lebeau(),
	haas_bioroid: m.haas_bioroid(),
	jinteki: m.jinteki(),
	nbn: m.nbn(),
	weyland_consortium: m.weyland_consortium(),
	neutral_corp: m.neutral_corp(),
	neutral_runner: m.neutral_runner()
};

export const card_types: Record<CardTypeIds, string> = {
	agenda: m.agenda(),
	asset: m.asset(),
	corp_identity: m.corp_identity(),
	event: m.event(),
	hardware: m.hardware(),
	ice: m.ice(),
	operation: m.operation(),
	program: m.program(),
	resource: m.resource(),
	runner_identity: m.runner_identity(),
	upgrade: m.upgrade()
};

export const publishers: Record<Publishers, string> = {
	null_signal_games: m.null_signal_games(),
	fantasy_flight_games: m.fantasy_flight_games()
};
