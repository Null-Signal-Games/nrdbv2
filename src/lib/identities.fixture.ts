import { createMockCard } from './test-helpers';

export const PRECISION_DESIGN = createMockCard(
	'haas_bioroid_precision_design',
	'Haas-Bioroid: Precision Design',
	['system_gateway'],
	{ side_id: 'corp', faction_id: 'haas_bioroid', card_type_id: 'corp_identity' }
);

export const RESTORING_HUMANITY = createMockCard(
	'jinteki_restoring_humanity',
	'Jinteki: Restoring Humanity',
	['system_gateway'],
	{ side_id: 'corp', faction_id: 'jinteki', card_type_id: 'corp_identity' }
);

export const ESA = createMockCard(
	'esa_afontov_eco_insurrectionist',
	'Esâ Afontov: Eco-Insurrectionist',
	['borealis'],
	{ side_id: 'runner', faction_id: 'anarch', card_type_id: 'runner_identity' }
);

export const TOPAN = createMockCard('topan_ormas_leader', 'Topan: Ormas Leader', ['elevation'], {
	side_id: 'runner',
	faction_id: 'anarch',
	card_type_id: 'runner_identity'
});

export const ZAHYA = createMockCard(
	'zahya_sadeghi_versatile_smuggler',
	'Zahya Sadeghi: Versatile Smuggler',
	['system_gateway'],
	{ side_id: 'runner', faction_id: 'criminal', card_type_id: 'runner_identity' }
);

export const TAO = createMockCard(
	'tao_salonga_telepresence_magician',
	'Tāo Salonga: Telepresence Magician',
	['system_gateway'],
	{ side_id: 'runner', faction_id: 'shaper', card_type_id: 'runner_identity' }
);

export const APEX = createMockCard(
	'apex_invasive_predator',
	'Apex: Invasive Predator',
	['data_and_destiny'],
	{ side_id: 'runner', faction_id: 'apex', card_type_id: 'runner_identity' }
);

export const SHRED = createMockCard('shred', 'Shred', ['elevation'], {
	side_id: 'runner',
	faction_id: 'anarch',
	card_type_id: 'event'
});
