import { defineConfig } from 'astro/config';

import db from "@astrojs/db";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind()],
  output: "server",
  site: "https://f1-bets-cobetes.vercel.app/"
});