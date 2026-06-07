import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterStatic from '@sveltejs/adapter-static';

// const isTauri = process.env.BUILD_TARGET === 'tauri';
const isTauri = !!process.env.TAURI_ENV_PLATFORM;


/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Tauri ships a fully static client bundle; the web build targets
		// Cloudflare Workers (see wrangler.jsonc + .github/workflows/deploy-web.yml).
		adapter: isTauri
			? adapterStatic({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html'
			}) : adapterCloudflare(),
		alias: {
			$components: 'src/components',
			$utils: 'src/utils',
			$hooks: 'src/lib/hooks',
			$constants: 'src/constants',
			$tools: 'src/tools',
			$stores: 'src/stores',
			"@": "./src/@",
		},
		serviceWorker: {
			register: true
		}
	}
};

export default config;
