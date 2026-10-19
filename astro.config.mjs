// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Firebase Hosting serves `dist/client` (see firebase.json / firebase.spark.json),
  // so keep the static output there rather than Astro's default `dist`.
  outDir: './dist/client',
  vite: {
    plugins: [tailwindcss()]
  }
});