/** @type {import('tailwindcss').Config} */
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        manrope: "Manrope-Regular",
        manropeSemi: "Manrope-SemiBold",
        manropeBold: "Manrope-Bold",
        manropeHeavy: "Manrope-ExtraBold",
      },
      colors: {
        // Change with the colour scheme; see src/theme/theme.tsx.
        bg: themed("bg"),
        surface: themed("surface"),
        "surface-muted": themed("surface-muted"),
        ink: themed("ink"),
        "ink-muted": themed("ink-muted"),
        "ink-faint": themed("ink-faint"),
        line: themed("line"),
        pos: themed("pos"),
        neg: themed("neg"),
        // Fixed fills, always under dark ink.
        lime: "#13EC5B",
        coral: "#FF5A36",
        onfill: "#0E0E10",
        food: "#FF8A00",
        transport: "#2F80FF",
        supplies: "#8B5CF6",
        fuel: "#FFD400",
        other: "#FF6FAE",
      },
    },
  },
  plugins: [],
};
