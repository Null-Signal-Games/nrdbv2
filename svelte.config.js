import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-node creates a standalone Node.js server
		// See https://svelte.dev/docs/kit/adapter-node for more information
		adapter: adapter({
			// You can specify options here
			// out: 'build',  // output directory (default: 'build')
			// precompress: true,  // precompress assets (default: true)
			// envPrefix: '',  // environment variable prefix (default: '')
		})
	}
};

export default config;
