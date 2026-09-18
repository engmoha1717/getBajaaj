/** @type {import('tailwindcss').Config} */
module.exports = {
  // "media": dark: classes follow the OS color scheme automatically.
  darkMode: "media",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Pulled directly from the RickshawGo Stitch project's designMd —
      // the simplified, actually-applied palette (not the full 40-token
      // Material set). Light-mode only: the source design has no dark
      // variant (designTheme.colorMode: LIGHT).
      colors: {
        primary: "#FFB800", // Auto Yellow
        ink: "#121212", // Charcoal Asphalt — primary CTA fill, primary text
        accent: "#008744", // Transit Green — confirmations/price points only
        surface: "#F6F7F9", // app canvas / resting input fill
        card: "#FFFFFF",
        divider: "#EBECEF",
        muted: "#6B7280",
        danger: "#D9383A",
        warning: "#EA580C",
      },
      // RN needs a distinct font family per weight — it won't synthesize
      // bold from a single regular-weight file.
      fontFamily: {
        jakarta: ["PlusJakartaSans_400Regular"],
        "jakarta-medium": ["PlusJakartaSans_500Medium"],
        "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
        "jakarta-bold": ["PlusJakartaSans_700Bold"],
        "jakarta-extrabold": ["PlusJakartaSans_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
