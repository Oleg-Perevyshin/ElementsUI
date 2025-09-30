import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(), sveltekit()
    // svelte({
    //   compilerOptions: {
    //     runes: true
    //   }
    // })
  ],
  build: {
    lib: {
      entry: 'src/lib/index.js',
      name: 'POE-SvelteUILib',
      fileName: (format) => `svelte-ui-lib.${format}.js`
    },
    rollupOptions: {
      external: ['svelte'],
      output: {
        globals: {
          svelte: 'Svelte'
        }
      }
    },
    
  }
})