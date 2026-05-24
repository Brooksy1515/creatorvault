import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1F2937",
        moss: "#5F7462",
        clay: "#B9957D",
        coral: "#D97757",
        skysoft: "#EEF6F4",
        oat: "#E7DCD2",
        canvas: "#FAFAF9"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 41, 55, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
