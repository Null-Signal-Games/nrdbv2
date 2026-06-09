import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import commandLineArgs from 'command-line-args';
import { createHash } from 'crypto';
import { deepStrictEqual } from 'assert';
import { CardSearchQueryBuilder, PrintingSearchQueryBuilder } from '../src/lib/search_grammar_and_builder.js';
import { adaptCard, adaptPrinting } from '../src/lib/adapter.js';
import type { Card, Printing } from '../src/lib/api.types.js';
import type { UnifiedCardRow, UnifiedPrintingRow } from '../src/lib/sqlite.types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Flags for the script.
interface CommandLineOptions {
	'limit': number;
	'api-prefix': string;
	'parallel': number;
	'num-parallel-requests'?: number;
}

// Interfaces for structures in this script.
interface SearchRequestItem {
	url: string;
	search: string;
	isCards: boolean;
}

interface PreparedItem extends SearchRequestItem {
	query: string;
	params: string[];
	buildError: string | null;
}

interface ComparisonCounters {
	totalPassed: number;
	totalFailed: number;
}

interface ParseFailure {
	filter: string;
	error: string;
	type: 'cards' | 'printings';
	category: string;
}

interface ComparisonResult {
	filter: string;
	type: 'cards' | 'printings';
	status: 'success' | 'mismatch' | 'failure:both' | 'fetch_error' | 'execute_error';
	localCount?: number;
	apiCount?: number;
	error?: string;
	apiStatus?: number;
	diffs?: string[];
	note?: string;
}

interface OutputData {
	timestamp: string;
	limit: number;
	summary: {
		totalUniqueFilters: number;
		totalFailedToParse: number;
		testedCount: number;
		passedComparisons: number;
		failedComparisons: number;
		bothFailedComparisons: number;
		apiCacheHits: number;
		apiCacheMisses: number;
	};
	groupedParseFailures: Record<string, number>;
	parseFailures: { filter: string; category: string; error: string }[];
	comparisonResults: ComparisonResult[];
}

interface CachedResponse {
	status: number;
	body: string;
}

let cacheHits = 0;
let cacheMisses = 0;

async function fetchCached(url: string): Promise<CachedResponse> {
	const hash = createHash('sha256').update(url).digest('hex');
	const cacheDir = path.resolve(__dirname, 'api-req-cache');
	// Use .json.txt to keep these out of scope for `npm run fmt:check`.
	const cachePath = path.join(cacheDir, `${hash}.json.txt`);

	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true });
	}

	if (fs.existsSync(cachePath)) {
		cacheHits++;
		const content = fs.readFileSync(cachePath, 'utf-8');
		return JSON.parse(content) as CachedResponse;
	}

	cacheMisses++;
	const res = await fetch(url);
	const status = res.status;
	const body = await res.text();

	const cachedData: CachedResponse = {
		status,
		body
	};

	fs.writeFileSync(cachePath, JSON.stringify(cachedData, null, 2), 'utf-8');
	return cachedData;
}



function categorizeError(errStr: string): string {
	const s = errStr.trim();
	if (s.startsWith('Unknown keyword')) {
		return 'Unknown keyword';
	}
	if (s.startsWith('Invalid value') && s.includes('for boolean field')) {
		return 'Invalid value for boolean field';
	}
	if (s.startsWith('Invalid value') && s.includes('for integer field')) {
		return 'Invalid value for integer field';
	}
	if (s.startsWith('Invalid value') && s.includes('for date field')) {
		return 'Invalid value for date field';
	}
	if (s.startsWith('Invalid boolean operator')) {
		return 'Invalid boolean operator';
	}
	if (s.startsWith('Invalid string operator')) {
		return 'Invalid string operator';
	}
	if (s.startsWith('Invalid format operator')) {
		return 'Invalid format operator';
	}
	if (s.includes('Expected') && (s.includes('Line 1') || s.includes('col '))) {
		return 'Syntax/Parsing error (Ohm parse failed)';
	}
	return s;
}

async function checkApiForLocallyFailed(
	item: PreparedItem,
	apiUrl: URL,
	index: number,
	comparisonResults: ComparisonResult[],
	counters: ComparisonCounters
) {
	try {
		const res = await fetchCached(apiUrl.toString());
		const isOk = res.status >= 200 && res.status < 300;
		if (isOk) {
			counters.totalFailed++;
			comparisonResults[index] = {
				filter: item.search,
				type: item.isCards ? 'cards' : 'printings',
				status: 'mismatch',
				error: `Local build failed: ${item.buildError}`,
				apiStatus: res.status,
				diffs: [`Local query build failed (${item.buildError}) but API returned 200 OK.`]
			};
		} else {
			counters.totalPassed++;
			comparisonResults[index] = {
				filter: item.search,
				type: item.isCards ? 'cards' : 'printings',
				status: 'failure:both',
				note: `Both local build and API failed (API status: ${res.status}, Local error: ${item.buildError})`
			};
		}
	} catch (e) {
		counters.totalFailed++;
		const message = e instanceof Error ? e.message : String(e);
		comparisonResults[index] = {
			filter: item.search,
			type: item.isCards ? 'cards' : 'printings',
			status: 'fetch_error',
			error: `Local build failed (${item.buildError}) and API fetch failed: ${message}`
		};
	}
}

function queryAndAdaptLocal(item: PreparedItem, db: Database.Database): (Card | Printing)[] {
	const mappedParams = item.params.map((p: string) => {
		if (p === 'true' || p === 't') return 1;
		if (p === 'false' || p === 'f') return 0;
		return p;
	});
	const rows = db.prepare(item.query).all(...mappedParams);
	return rows.map(row =>
		item.isCards
			? adaptCard(row as UnifiedCardRow)
			: adaptPrinting(row as UnifiedPrintingRow)
	);
}

async function queryApi(apiUrl: URL): Promise<(Card | Printing)[]> {
	const res = await fetchCached(apiUrl.toString());
	const isOk = res.status >= 200 && res.status < 300;
	if (!isOk) {
		throw new Error(`HTTP status ${res.status}`);
	}
	const json = JSON.parse(res.body) as { data: (Card | Printing)[] };
	return json.data || [];
}

function groupAndPrintErrors(parseFailures: ParseFailure[]): Record<string, number> {
	const groupedErrors: Record<string, number> = {};
	for (const failure of parseFailures) {
		groupedErrors[failure.category] = (groupedErrors[failure.category] || 0) + 1;
	}

	if (parseFailures.length > 0) {
		console.log(`\n=== GROUPED PARSE/BUILD FAILURES SUMMARY ===`);
		Object.entries(groupedErrors)
			.sort((a, b) => b[1] - a[1])
			.forEach(([category, count]) => {
				console.log(`- ${category}: ${count} occurrence(s)`);
			});
		console.log(`============================================`);
	}
	return groupedErrors;
}

// Separate helper for writing output
function writeJsonResultsFile(outputData: OutputData) {
	const outputPath = path.resolve(__dirname, 'search-comparison-results.json');
	try {
		fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
		console.log(`\nResults successfully written to: ${outputPath}`);
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		console.error(`Failed to write JSON results file:`, message);
	}
}

function buildSqliteQuery(
	item: SearchRequestItem,
	parseFailures: ParseFailure[]
): PreparedItem {
	let query = '';
	let params: string[] = [];
	let buildError: string | null = null;

	try {
		if (item.isCards) {
			const builder = new CardSearchQueryBuilder(item.search);
			if (builder.parse_error) {
				buildError = builder.parse_error.message;
			} else {
				query = `SELECT * FROM unified_cards WHERE ${builder.where}`;
				params = builder.where_values;
			}
		} else {
			const builder = new PrintingSearchQueryBuilder(item.search);
			if (builder.parse_error) {
				buildError = builder.parse_error.message;
			} else {
				query = `SELECT * FROM unified_printings WHERE ${builder.where}`;
				params = builder.where_values;
			}
		}
	} catch (e) {
		buildError = e instanceof Error ? e.message : String(e);
	}

	if (buildError) {
		const category = categorizeError(buildError);
		parseFailures.push({
			filter: item.search,
			error: buildError,
			type: item.isCards ? 'cards' : 'printings',
			category
		});
	}

	return {
		...item,
		query,
		params,
		buildError
	};
}

function normalizeQueryUrl(rawLine: string) {
	let line = rawLine;
	if (line.startsWith('//')) {
		line = '/' + line.slice(2);
	} else if (!line.startsWith('/')) {
		line = '/' + line;
	}
	return line;
}

async function main() {
	const optionDefinitions = [
		{ name: 'limit', type: Number, defaultValue: 10 },
		{ name: 'api-prefix', type: String, defaultValue: 'https://api.netrunnerdb.com' },
		{ name: 'parallel', type: Number, defaultValue: 5 },
		{ name: 'num-parallel-requests', type: Number }
	];

	let options: CommandLineOptions;
	try {
		options = commandLineArgs(optionDefinitions) as CommandLineOptions;
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		console.error(`Invalid command line arguments: ${message}`);
		process.exit(1);
	}

	const limit = options.limit;
	const apiPrefix = options['api-prefix'];
	const parallel = options['num-parallel-requests'] !== undefined ? options['num-parallel-requests'] : options.parallel;

	if (!Number.isInteger(limit) || limit <= 0) {
		console.error(`Error: --limit must be a positive integer (received ${limit})`);
		process.exit(1);
	}

	if (!Number.isInteger(parallel) || parallel <= 0) {
		console.error(`Error: parallel concurrency count must be a positive integer (received ${parallel})`);
		process.exit(1);
	}

	console.log(`Starting comparison with limit = ${limit}, api-prefix = ${apiPrefix}, parallel-requests = ${parallel}...`);

	// Open SQLite database
	const dbPath = path.resolve(__dirname, '../test-data/netrunnerdb.sqlite3');
	if (!fs.existsSync(dbPath)) {
		console.error(`SQLite database not found at ${dbPath}`);
		process.exit(1);
	}
	const db = new Database(dbPath, { readonly: true });
	db.function('regexp', (regex: string, str: string) => {
		try {
			return new RegExp(regex, 'i').test(str) ? 1 : 0;
		} catch {
			return 0;
		}
	});

	// Open search queries from API server logs as source of comparisons
	const txtPath = path.resolve(__dirname, 'search-query-requests.txt');
	if (!fs.existsSync(txtPath)) {
		console.error(`Query requests file not found at ${txtPath}`);
		process.exit(1);
	}

	const rawLines = fs.readFileSync(txtPath, 'utf-8')
		.split('\n')
		.map(line => line.trim())
		.filter(line => line.length > 0);

	// Build a unique set of search filters to test, URLs and types.
	const deduplicated = new Map<string, SearchRequestItem>();
	for (const rawLine of rawLines) {
		const line = normalizeQueryUrl(rawLine);

		try {
			const url = new URL(line, 'https://api.netrunnerdb.com');
			const searchParam = url.searchParams.get('filter[search]') || '';
			if (!searchParam) continue;

			const isCards = url.pathname.includes('/cards');
			const isPrintings = url.pathname.includes('/printings');
			if (!isCards && !isPrintings) continue;

			if (!deduplicated.has(searchParam)) {
				deduplicated.set(searchParam, {
					url: line,
					search: searchParam,
					isCards
				});
			}
		} catch (e) {
			console.warn(`Failed to parse URL fragment: "${line}"`, e);
		}
	}
	console.log(`Deduplicated down to ${deduplicated.size} unique search filters.`);

	const allDeduplicated = Array.from(deduplicated.values());
	const itemsToTest = allDeduplicated.slice(0, limit);
	console.log(`Testing first ${itemsToTest.length} deduplicated filters...`);

	const counters: ComparisonCounters = { totalPassed: 0, totalFailed: 0 };
	const parseFailures: ParseFailure[] = [];
	const comparisonResults: ComparisonResult[] = new Array(itemsToTest.length);

	// Build SQLite queries synchronously before invoking any DB or API queries.
	console.log(`Building SQLite queries for all items...`);
	const preparedItems = itemsToTest.map(item => buildSqliteQuery(item, parseFailures));

	let nextIndex = 0;
	let completedCount = 0;

	async function worker() {
		while (true) {
			const index = nextIndex++;
			if (index >= preparedItems.length) break;

			const item = preparedItems[index];

			// Build API URL
			const apiUrl = new URL(item.isCards ? `${apiPrefix}/api/v3/public/cards` : `${apiPrefix}/api/v3/public/printings`);
			apiUrl.searchParams.set('filter[search]', item.search);
			apiUrl.searchParams.set('page[size]', '3000');

			if (item.buildError) {
				await checkApiForLocallyFailed(item, apiUrl, index, comparisonResults, counters);
				completedCount++;
				if (completedCount % 100 === 0 || completedCount === preparedItems.length) {
					console.log(`Running comparisons: ${completedCount}/${preparedItems.length}...`);
				}
				continue;
			}

			// Run SQLite query and fetch from API in parallel
			const [localSettled, apiSettled] = await Promise.allSettled([
				Promise.resolve().then(() => queryAndAdaptLocal(item, db)),
				queryApi(apiUrl)
			]);

			if (localSettled.status === 'rejected') {
				counters.totalFailed++;
				const message = localSettled.reason instanceof Error ? localSettled.reason.message : String(localSettled.reason);
				comparisonResults[index] = {
					filter: item.search,
					type: item.isCards ? 'cards' : 'printings',
					status: 'execute_error',
					error: message
				};
				completedCount++;
				if (completedCount % 100 === 0 || completedCount === preparedItems.length) {
					console.log(`Running comparisons: ${completedCount}/${preparedItems.length}...`);
				}
				continue;
			}

			if (apiSettled.status === 'rejected') {
				counters.totalFailed++;
				const message = apiSettled.reason instanceof Error ? apiSettled.reason.message : String(apiSettled.reason);
				comparisonResults[index] = {
					filter: item.search,
					type: item.isCards ? 'cards' : 'printings',
					status: 'fetch_error',
					error: message
				};
				completedCount++;
				if (completedCount % 100 === 0 || completedCount === preparedItems.length) {
					console.log(`Running comparisons: ${completedCount}/${preparedItems.length}...`);
				}
				continue;
			}

			const localResults = localSettled.value;
			const apiResults = apiSettled.value;

			// Sort both arrays by ID to make comparison order-independent
			localResults.sort((a, b) => a.id.localeCompare(b.id));
			apiResults.sort((a, b) => a.id.localeCompare(b.id));

			// Use the Node.js assert module for deep equality to compare objects without manual manipulation to prepare for simple diffs.
			let isEqual = true;
			try {
				deepStrictEqual(localResults, apiResults);
			} catch {
				isEqual = false;
			}

			if (isEqual) {
				counters.totalPassed++;
				comparisonResults[index] = {
					filter: item.search,
					type: item.isCards ? 'cards' : 'printings',
					status: 'success',
					localCount: localResults.length,
					apiCount: apiResults.length
				};
			} else {
				counters.totalFailed++;
				comparisonResults[index] = {
					filter: item.search,
					type: item.isCards ? 'cards' : 'printings',
					status: 'mismatch',
					localCount: localResults.length,
					apiCount: apiResults.length
				};
			}

			completedCount++;
			if (completedCount % 100 === 0 || completedCount === preparedItems.length) {
				console.log(`Running comparisons: ${completedCount}/${preparedItems.length}...`);
			}
		}
	}

	console.log(`Starting comparisons with concurrency of ${parallel}...`);
	const workers = Array.from({ length: Math.min(parallel, preparedItems.length) }, () => worker());
	await Promise.all(workers);

	let totalBothFailed = 0;
	comparisonResults.forEach(r => {
		if (r && r.status === 'failure:both') {
			totalBothFailed++;
		}
	});

	console.log(`\nComparison complete: ${counters.totalPassed} passed, ${counters.totalFailed} failed, ${totalBothFailed} both failed.`);
	console.log(`API caching stats: ${cacheHits + cacheMisses} total requests, ${cacheHits} cache hits, ${cacheMisses} cache misses (issued).`);

	const groupedErrors = groupAndPrintErrors(parseFailures);

	const outputData: OutputData = {
		timestamp: new Date().toISOString(),
		limit,
		summary: {
			totalUniqueFilters: allDeduplicated.length,
			totalFailedToParse: parseFailures.length,
			testedCount: itemsToTest.length,
			passedComparisons: counters.totalPassed,
			failedComparisons: counters.totalFailed,
			bothFailedComparisons: totalBothFailed,
			apiCacheHits: cacheHits,
			apiCacheMisses: cacheMisses
		},
		groupedParseFailures: groupedErrors,
		parseFailures: parseFailures.map(f => ({ filter: f.filter, category: f.category, error: f.error })),
		comparisonResults
	};

	writeJsonResultsFile(outputData);

	db.close();
	process.exit(0);
}

main().catch(err => {
	console.error('Fatal error during execution:', err);
	process.exit(1);
});

