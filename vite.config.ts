// vite.config.ts
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import adapter from "@sveltejs/adapter-static"
import tailwindcss from "@tailwindcss/vite"
import compression from "vite-plugin-compression"

export default defineConfig({
  plugins: [
    tailwindcss(),
    /* С SvelteKit 3 конфиг Svelte/Kit живёт здесь (svelte.config.js не поддерживается); его же читают svelte-package и svelte-check */
    sveltekit({
      preprocess: vitePreprocess(),
      compilerOptions: { runes: true },
      adapter: adapter({ pages: "docs", assets: "docs", fallback: null, precompress: false }),
      paths: { base: "/ElementsUI", relative: false },
      prerender: { handleHttpError: "warn" },
      /* SvelteKit 3 убрал встроенный $lib (замена — #lib); весь код библиотеки на $lib, svelte-package переписывает его в относительные пути */
      alias: { $lib: "src/lib" },
    }),
    // compression({
    //   verbose: true,
    //   disable: false,
    //   threshold: 10240,
    //   algorithm: 'gzip',
    //   ext: '.gz',
    //   deleteOriginFile: true,
    // }),
  ],
  build: {
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: ["maplibre-gl"], // Это говорит Vite не включать её в сборку
    },
  },
})
