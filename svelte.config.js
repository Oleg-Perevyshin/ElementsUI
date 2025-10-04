import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
  },
  kit: {
    adapter: adapter({
      pages: 'docs',
      assets: 'docs',
      fallback: null,
      precompress: false,
    }),
    paths: {
      base: process.argv.includes('dev') ? '' : '/ElementsUI',
      relative: false,
    },
    prerender: {
      handleHttpError: 'warn',
    },
  },
}
