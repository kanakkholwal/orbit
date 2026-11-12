import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';



export default defineConfig({
	resolve: {
		// pandoc-wasm only exports its entry, but the environment-agnostic core is what the worker needs.
		alias: { 'pandoc-wasm/core': resolve('node_modules/pandoc-wasm/src/core.js') }
	},
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit()
	],
	clearScreen: false,
	server: {
		watch: {
			// tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**'],
		},

	},
	// Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
	envPrefix: ['VITE_', 'TAURI_ENV_*']
});
