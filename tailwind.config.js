/** @type {import('tailwindcss').Config} */
module.exports = {
  // "media": dark: classes follow the OS color scheme automatically.
  darkMode: "media",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
