import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: "rgb(37 99 235)", // text-blue-600
              textDecoration: "none",
              fontWeight: "inherit",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            code: {
              backgroundColor: "rgb(243 244 246)", // bg-gray-100
              borderRadius: "0.25rem",
              padding: "0.125rem 0.375rem",
              fontWeight: "500",
              "&::before": { content: "none" },
              "&::after": { content: "none" },
            },
          },
        },
        invert: {
          css: {
            a: {
              color: "rgb(59 130 246)", // text-blue-500
            },
            code: {
              backgroundColor: "rgb(31 41 55)", // bg-gray-800
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
