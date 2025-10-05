// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-static'

export default {
  preprocess: vitePreprocess({ postcss: true }),
  compilerOptions: { runes: true },
  kit: {
    adapter: adapter({ pages: 'docs', assets: 'docs', fallback: null, precompress: false }),
    paths: { base: '/ElementsUI', relative: false },
    prerender: { handleHttpError: 'warn' },
  },
}
