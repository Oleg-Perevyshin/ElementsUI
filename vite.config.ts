// vite.config.ts
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import adapter from "@sveltejs/adapter-static"
import tailwindcss from "@tailwindcss/vite"
import compression from "vite-plugin-compression"
import { readFileSync } from "node:fs"

/* Версия библиотеки для шапки витрины — из package.json при сборке, в бандл попадает только строка версии */
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string }

export default defineConfig({
  define: { __LIB_VERSION__: JSON.stringify(version) },
  plugins: [
    tailwindcss(),
    /* С SvelteKit 3 конфиг Svelte/Kit живёт здесь (svelte.config.js не поддерживается); его же читают svelte-package и svelte-check.
       Витрина импортирует библиотеку через #lib (package.json imports), сама библиотека — относительными путями */
    sveltekit({
      preprocess: vitePreprocess(),
      compilerOptions: { runes: true },
      adapter: adapter({ pages: "docs", assets: "docs", fallback: null, precompress: false }),
      paths: { base: "/ElementsUI", relative: false },
      prerender: { handleHttpError: "warn" },
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
    sourcemap: false,
    rollupOptions: {
      external: ["maplibre-gl"], // Это говорит Vite не включать её в сборку
    },
  },
})
