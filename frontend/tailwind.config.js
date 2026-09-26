/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16213A",
        paper: "#EDEFEA",
        panel: "#FFFFFF",
        line: "#D8DBD4",
        muted: "#6C7268",
        brand: {
          DEFAULT: "#2F5D8A",
          dark: "#20456A",
          light: "#E7EEF4",
        },
        amber: {
          DEFAULT: "#D98E29",
          light: "#FBF0DD",
        },
        brick: {
          DEFAULT: "#C1443C",
          light: "#FAE7E5",
        },
        moss: {
          DEFAULT: "#3A7D5C",
          light: "#E4F0E9",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
