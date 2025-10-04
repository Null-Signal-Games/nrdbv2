import { NRDB_API_URL } from '$lib/constants';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	// TODO: Update query strings to use real filters to get the expected results
	const routes: { path: string; title: string; query: string }[] = [
		{
			path: 'recent',
			title: 'Recent Decklists',
			query: '?page[size]=30'
		},
		{
			path: 'of-the-week',
			title: 'Decklists of the Week',
			query: '?page[size]=30'
		},
		{
			path: 'tournament',
			title: 'Tournament Decklists',
			query: '?page[size]=30&sort=-votes'
		},
		{
			path: 'hot-topics',
			title: 'Hot Topics Decklists',
			query: '?page[size]=30'
		},
		{
			path: 'hall-of-fame',
			title: 'Decklist Hall of fame',
			query: '?page[size]=30'
		},
		{
			path: 'mine',
			title: 'My Decklists',
			query: '?page[size]=30'
		},
		{
			path: 'favorites',
			title: 'Favorite Decklists',
			query: '?page[size]=30'
		}
	];

	// TODO: Add logic to handle 'mine' and 'favorites' paths, as these will require user authentication to view/load

	// TODO: Append filters to fetch correct results (i.e. popular, hot, hall of)
	const response = await fetch(`${NRDB_API_URL}/decklists?page[size]=30&sort=-created_at`);
	const decklists = await response.json();

	if (!routes.find((route) => route.path === params.category)) {
		throw error(404, 'Category not found');
	}

	return {
		title: routes.find((route) => route.path === params.category)?.title,
		decklists: decklists.data
	};
}
