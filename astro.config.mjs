// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  site: "https://f1-bets-cobetes.vercel.app",

  /*vite: {
    plugins: [tailwindcss()]
  },*/

  integrations: [tailwind()],

  adapter: vercel()
});
