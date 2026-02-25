import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';


export default defineConfig({
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit()
	],
	clearScreen: false,
	server: {
		port: 3000,
		open: true,
		strictPort: true,
	}
});
