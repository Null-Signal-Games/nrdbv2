<script lang="ts">
	/**
	 * TODO: Implement full decklist search functionality (compared to NRDBc)
	 * - Fetch and display search results from NRDB API
	 * - Handle loading states and errors
	 * - Add pagination if necessary
	 * - Improve UI/UX with better styling and responsiveness
	 * - Consider debouncing input for search
	 * - Refactor data (i.e. factions, packs, cycles) to be fetched from store (IndexedDB) instead of hardcoded values
	 */
	import DecklistItem from '$lib/components/decklist/Item.svelte';
	import { NRDB_API_URL } from '$lib/constants';
	import type { Decklist } from '$lib/types';

	// Search state
	let search_results = $state<Decklist[]>([]);
	let is_searching = $state<boolean>(false);
	// let found_cards = $state<Card[]>([]);

	// Form values
	let filter = {
		selectedFaction: '',
		selectedSort: 'popularity',
		selectedRotation: '',
		authorName: '',
		decklistTitle: '',
		isLegal: '',
		mwlCode: '',
		selectedPacks: []
	};

	// Mock search function - replace with actual decklist search logic
	const search = async (event: Event) => {
		event.preventDefault();

		is_searching = true;

		try {
			const form_data = new FormData(event.target as HTMLFormElement);
			// TODO: temporary fix for TS error, investigate further
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const parameters = new URLSearchParams();
			for (const [key, value] of form_data.entries()) {
				if (value !== '') {
					parameters.append(key, value as string);
				}
			}
			const response = await fetch(`${NRDB_API_URL}/decklists?` + parameters.toString());

			const json = await response.json();
			search_results = json.data;
		} catch (error) {
			console.error('Search error:', error);
			search_results = [];
			is_searching = false;
		} finally {
			is_searching = false;
		}
	};

	// Faction options
	const factions = [
		{ value: '', label: 'Ignore' },
		{ value: 'corp', label: 'any Corp' },
		{ value: 'haas-bioroid', label: 'Haas-Bioroid' },
		{ value: 'jinteki', label: 'Jinteki' },
		{ value: 'nbn', label: 'NBN' },
		{ value: 'weyland-consortium', label: 'Weyland' },
		{ value: 'neutral-corp', label: 'Neutral Corp' },
		{ value: 'runner', label: 'any Runner' },
		{ value: 'anarch', label: 'Anarch' },
		{ value: 'criminal', label: 'Criminal' },
		{ value: 'shaper', label: 'Shaper' },
		{ value: 'adam', label: 'Adam' },
		{ value: 'apex', label: 'Apex' },
		{ value: 'sunny-lebeau', label: 'Sunny Lebeau' },
		{ value: 'neutral-runner', label: 'Neutral Runner' }
	];

	// const sort_options = [
	//     { value: "popularity", label: "by Popularity" },
	//     { value: "date", label: "by Date" },
	//     { value: "likes", label: "by Number of Likes" },
	//     { value: "reputation", label: "by Reputation of Author" }
	// ];

	const rotation_options = [
		{ value: '', label: 'Ignore' },
		{ value: '7', label: 'Seventh Rotation' },
		{ value: '6', label: 'Sixth Rotation' },
		{ value: '5', label: 'Fifth Rotation' },
		{ value: '4', label: 'Fourth Rotation' },
		{ value: '3', label: 'Third Rotation' },
		{ value: '2', label: 'Second Rotation' },
		{ value: '1', label: 'First Rotation' }
	];

	const tournament_legality = [
		{ value: '', label: 'Ignore' },
		{ value: '1', label: 'Yes' },
		{ value: '0', label: 'No' }
	];

	const legality = [
		{ value: '', label: 'Ignore' },
		{ value: 'standard-ban-list-25-10', label: 'Standard Ban List 25.10' },
		{ value: 'standard-ban-list-25-08', label: 'Standard Ban List 25.08' },
		{ value: 'standard-ban-list-25-04', label: 'Standard Ban List 25.04' },
		{
			value: 'startup-balance-update-25-04-for-classic-only',
			label: 'Startup Balance Update 25.04 (ignore active date)'
		},
		{ value: 'standard-ban-list-24-12', label: 'Standard Ban List 24.12' },
		{ value: 'standard-ban-list-24-09', label: 'Standard Banlist 24.09' },
		{
			value: 'startup-ban-list-24-09-for-classic-only',
			label: 'Startup Ban List 24.09 (ignore active date)'
		},
		{ value: 'standard-ban-list-24-05', label: 'Standard Ban List 24.05' },
		{ value: 'standard-ban-list-24-03', label: 'Standard Ban List 24.03' },
		{ value: 'standard-ban-list-23-09', label: 'Standard Ban List 23.09' },
		{ value: 'sunset-ban-list-24-01', label: 'Sunset Ban List 24.01' },
		{
			value: 'startup-ban-list-24-01-for-classic-only',
			label: 'Startup Ban List 24.01 (ignore active date)'
		},
		{ value: 'standard-ban-list-23-08', label: 'Standard Ban List 23.08' },
		{ value: 'standard-ban-list-23-03', label: 'Standard Ban List 23.03' },
		{ value: 'standard-ban-list-22-09', label: 'Standard Ban List 22.09' },
		{ value: 'standard-ban-list-22-08', label: 'Standard Ban List 22.08' },
		{ value: 'standard-ban-list-21-10', label: 'Standard Ban List 21.10' },
		{ value: 'standard-ban-list-21-06', label: 'Standard Ban List 21.06' },
		{ value: 'standard-ban-list-21-05', label: 'Standard Ban List 21.05' },
		{ value: 'standard-ban-list-21-04', label: 'Standard Ban List 21.04' },
		{ value: 'standard-ban-list-20-09', label: 'Standard Ban List 20.09' },
		{ value: 'standard-ban-list-20-06', label: 'Standard Ban List 20.06' },
		{ value: 'standard-mwl-3-4-b', label: 'Standard MWL 3.4b' },
		{ value: 'standard-mwl-3-4', label: 'Standard MWL 3.4' },
		{ value: 'standard-mwl-3-3', label: 'Standard MWL 3.3' },
		{ value: 'standard-mwl-3.2', label: 'Standard MWL 3.2' },
		{ value: 'standard-mwl-3.1', label: 'Standard MWL 3.1' },
		{ value: 'standard-mwl-3-0', label: 'Standard MWL 3.0' },
		{ value: 'NAPD_MWL_2.2', label: 'NAPD MWL 2.2' },
		{ value: 'NAPD_MWL_2.1', label: 'NAPD MWL 2.1' },
		{ value: 'NAPD_MWL_2.0', label: 'NAPD MWL 2.0' },
		{ value: 'NAPD_MWL_1.2', label: 'NAPD MWL 1.2' },
		{ value: 'NAPD_MWL_1.1', label: 'NAPD MWL 1.1' },
		{ value: 'NAPD_MWL_1.0', label: 'NAPD MWL 1.0' }
	];

	// Example packs (replace with real data)
	const packs = [
		{ value: 'elev', label: 'Elevation', checked: true },
		{ value: 'rwr', label: 'Rebellion Without Rehearsal', checked: true },
		{ value: 'tai', label: 'The Automata Initiative', checked: true }
		// ... add all packs here
	];

	// Example cycles (replace with real data)
	const cycles = [
		{
			value: 'liberation',
			label: 'Liberation',
			checked: true,
			packs: [
				{ value: 'rwr', label: 'Rebellion Without Rehearsal', checked: true },
				{ value: 'tai', label: 'The Automata Initiative', checked: true }
			]
		}
		// ... add all cycles here
	];

	// Packs selection logic (stub)
	function selectStartup() {}
	function selectStandard() {}
	function selectNSG() {}
	function selectAll() {}
	function selectNone() {}
</script>

<form onsubmit={search}>
	<div>
		<div>
			<label for="faction">Side or Faction</label>
			<select name="faction" id="faction" bind:value={filter.selectedFaction}>
				{#each factions as faction (faction.value)}
					<option value={faction.value}>{faction.label}</option>
				{/each}
			</select>
		</div>

		<!-- TODO: implement card search with suggestions (text only) -->
		<!-- <div>
            <label for="card_filter">Cards used</label>
            <input type="text" placeholder="Enter card title" bind:value={filter.cardFilter} name="card_filter" id="card_filter" />
            {#if found_cards.length > 0}
                <div class="card-suggestions">
                    {#each found_cards as card}
                        <div class="card-suggestion" onclick={() => { 
                            cardFilter = card.attributes.title;
                            found_cards = [];
                        }}>
                            {card.attributes.title}
                        </div>
                    {/each}
                </div>
            {/if}
        </div> -->

		<!-- TODO: resolve API response error when `sort` query is present -->
		<!-- <div>
            <label for="sort">Sort</label>
            <select name="sort" id="sort" bind:value={filter.selectedSort}>
                {#each sort_options as s}
                    <option value={s.value}>{s.label}</option>
                {/each}
            </select>
        </div> -->

		<div>
			<label for="rotation_id">Rotation</label>
			<select name="rotation_id" id="rotation_id" bind:value={filter.selectedRotation}>
				{#each rotation_options as rotation (rotation.value)}
					<option value={rotation.value}>{rotation.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div>
		<div>
			<label for="author">Author name</label>
			<input
				type="text"
				name="author"
				id="author"
				placeholder="Enter author name"
				bind:value={filter.authorName}
			/>
		</div>
		<div>
			<label for="title">Decklist name</label>
			<input
				type="text"
				name="title"
				id="title"
				placeholder="Enter decklist name"
				bind:value={filter.decklistTitle}
			/>
		</div>
		<div>
			<label for="is_legal">Tournament Legal</label>
			<select name="is_legal" id="is_legal" bind:value={filter.isLegal}>
				{#each tournament_legality as tournament_legality (tournament_legality.value)}
					<option value={tournament_legality.value}>{tournament_legality.label}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="mwl_code">Legality</label>
			<select name="mwl_code" id="mwl_code" bind:value={filter.mwlCode}>
				{#each legality as legality (legality.value)}
					<option value={legality.value}>{legality.label}</option>
				{/each}
			</select>
		</div>
		<button type="submit" disabled={is_searching}> Search </button>
	</div>

	<div>
		<p>Filter by card pool</p>
		<div>
			<!-- TODO: these should toggle on/off, will require additiona logic in `search` func to handle URL parameter formatting -->
			<button type="button" onclick={selectStartup}>Startup</button> |
			<button type="button" onclick={selectStandard}>Standard</button> |
			<button type="button" onclick={selectNSG}>NSG</button> |
			<button type="button" onclick={selectAll}>All</button> |
			<button type="button" onclick={selectNone}>None</button>
		</div>
		<div>
			<!-- Packs and cycles, simplified -->
			{#each cycles as cycle (cycle.value)}
				<div>
					<label>
						<input
							type="checkbox"
							name={'cycle_' + cycle.value}
							value={cycle.value}
							checked={cycle.checked}
						/>
						{cycle.label}
					</label>
					<ul>
						{#each cycle.packs as pack (pack.value)}
							<li>
								<label>
									<input type="checkbox" name="packs[]" value={pack.value} checked={pack.checked} />
									{pack.label}
								</label>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
			{#each packs as pack (pack.value)}
				<div>
					<label>
						<input type="checkbox" name="packs[]" value={pack.value} checked={pack.checked} />
						{pack.label}
					</label>
				</div>
			{/each}
		</div>
	</div>
</form>

<!-- Search Results Section -->
<h2>Search Results</h2>
<section class="search-results">
	{#if Array.isArray(search_results) && search_results.length > 0}
		{#each search_results as deck (deck.id)}
			<DecklistItem decklist={deck} />
		{/each}
	{:else}
		<div class="no-results">No decklists found matching your criteria.</div>
	{/if}
</section>
