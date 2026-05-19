import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: "#E8635A",
          blue: "#5B8DEF",
          yellow: "#F5C518",
          green: "#00B894",
          dark: "#1A1A2E",
          surface: "#F2F2F7",
          card: "#FFFFFF",
          border: "#E5E5EA",
          text: "#1A1A2E",
          muted: "#8E8E93",
          purple: "#7C3AED",
          pink: "#EC4899",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
