import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true
  },
  kit: {
    adapter: adapter({pages: 'docs'}),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
  },
  
};