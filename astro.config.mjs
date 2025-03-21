// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: "https://f1-bets-cobetes.vercel.app",

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  integrations: [react()]
});