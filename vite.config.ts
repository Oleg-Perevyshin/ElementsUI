// vite.config.ts
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import compression from "vite-plugin-compression"

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
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
