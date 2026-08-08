import { adaptCard, adaptFaction } from '$lib/adapter';
import { sql } from '$lib/sqlite';
import type { FormatCycles } from '$lib/deck_formats';
import type { FactionRow, UnifiedCardRow } from '$lib/types';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ data, url }) => {
	const factions: FactionRow[] = await sql`SELECT * FROM factions`;
	const identities: UnifiedCardRow[] =
		await sql`SELECT * FROM unified_cards WHERE card_type_id IN ('corp_identity', 'runner_identity')`;

	const formatCycleRows: { format_id: string; card_cycle_id: string }[] = await sql`
		SELECT f.id AS format_id, pc.card_cycle_id AS card_cycle_id
		FROM formats f
		JOIN snapshots s ON s.id = f.active_snapshot_id
		JOIN card_pools_card_cycles pc ON pc.card_pool_id = s.card_pool_id
	`;

	const format_cycles: FormatCycles = {};
	for (const row of formatCycleRows) {
		(format_cycles[row.format_id] ??= []).push(row.card_cycle_id);
	}

	if (identities.length === 0) return { ...data };

	const identityId = url.searchParams.get('identity');
	const identity = identityId ? identities.find((row) => row.id === identityId) : undefined;

	const sideCards: UnifiedCardRow[] = identity
		? await sql`SELECT * FROM unified_cards WHERE side_id = ${identity.side_id}`
		: [];

	return {
		...data,
		factions: factions.map(adaptFaction),
		cards: identities.map(adaptCard),
		side_cards: sideCards.map(adaptCard),
		format_cycles
	};
};
