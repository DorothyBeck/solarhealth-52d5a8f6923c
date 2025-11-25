import type { Config } from "tailwindcss";
import { tokens } from "./design-tokens";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: tokens.colors.light,
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing).map(([key, value]) => [key, `${value}px`])
      ) as Record<string, string>,
      fontFamily: tokens.typography.fontFamily,
      fontSize: Object.fromEntries(
        Object.entries(tokens.typography.fontSize).map(([key, value]) => [key, `${value}px`])
      ) as Record<string, string>,
      fontWeight: Object.fromEntries(
        Object.entries(tokens.typography.fontWeight).map(([key, value]) => [key, String(value)])
      ) as Record<string, string>,
      borderRadius: Object.fromEntries(
        Object.entries(tokens.borderRadius).map(([key, value]) => [key, `${value}px`])
      ) as Record<string, string>,
      boxShadow: tokens.shadows,
      transitionDuration: {
        fast: tokens.transitions.fast,
        normal: tokens.transitions.normal,
        slow: tokens.transitions.slow,
      },
    },
  },
  plugins: [],
};

export default config;


