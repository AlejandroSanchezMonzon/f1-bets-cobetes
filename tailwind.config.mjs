import animations from "@midudev/tailwind-animations";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"F1 Regular"', "sans-serif"],
        bold: ['"F1 Bold"', "sans-serif"],
        italic: ['"F1 Italic"', "sans-serif"],
        black: ['"F1 Black"', "sans-serif"],
        wide: ['"F1 Wide"', "sans-serif"],
      },
      colors: {
        primary: "#fafafa",
        secondary: "#0a0a0a",
        accent: "#294643",
        footer: "#171717",
      },
    },
  },
  plugins: [animations],
};
