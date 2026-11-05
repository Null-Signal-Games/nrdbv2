import { paraglideVitePlugin } from '@inlang/paraglide-js';
import sqlocal from 'sqlocal/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		watch: {
			ignored: ['**/project.inlang/.lix/**']
		}
	},
	plugins: [
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'localStorage', 'baseLocale', 'preferredLanguage']
		}),
		sqlocal(),
		{
			name: 'preview-cross-origin-isolation',
			enforce: 'pre',
			configurePreviewServer(server) {
				server.middlewares.use((_, res, next) => {
					res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
					res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
					next();
				});
			}
		},
		sveltekit()
	]
});
