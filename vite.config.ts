import { paraglideVitePlugin } from '@inlang/paraglide-js';
import sqlocal from 'sqlocal/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'localStorage', 'baseLocale', 'preferredLanguage']
		}),
		sqlocal(),
		sveltekit()
	]
});
