import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d8eeff",
          200: "#b9e2ff",
          300: "#89d1ff",
          400: "#52b6ff",
          500: "#2a95ff",
          600: "#0b72f5",
          700: "#075ae1",
          800: "#0d4ab5",
          900: "#11408e",
          950: "#0b2657",
        },
      },
    },
  },
  plugins: [],
};
export default config;
