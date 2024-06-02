import { defineConfig } from 'astro/config';
import db from "@astrojs/db";
import tailwind from "@astrojs/tailwind";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind()],
  output: "server",
  site: "https://f1-bets-cobetes.vercel.app/",
  adapter: vercel()
});