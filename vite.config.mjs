import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig({
	plugins: [
		svelte({
			preprocess: sveltePreprocess()
		})
	],
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				entryFileNames: 'build/bundle.js',
				chunkFileNames: 'build/bundle-[name].js',
				assetFileNames: (assetInfo) => {
					if (assetInfo.name && assetInfo.name.endsWith('.css')) {
						return 'build/bundle.css';
					}
					return 'build/[name][extname]';
				}
			}
		}
	}
});
