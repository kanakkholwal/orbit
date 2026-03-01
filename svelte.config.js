import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';

// const isTauri = process.env.BUILD_TARGET === 'tauri';
const isTauri = !!process.env.TAURI_ENV_PLATFORM;


/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: isTauri
			? adapterStatic({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html'
			}) : adapter(),
		alias: {
			$components: 'src/components',
			$utils: 'src/utils',
			$constants: 'src/constants',
			$tools: 'src/tools',
			$stores: 'src/stores',
			$utils: 'src/utils',
			"@": "./src/@",
		}
	}
};

export default config;
