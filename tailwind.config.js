/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        manrope: "Manrope-Regular",
        manropeBold: "Manrope-Bold",
      },
      colors: {
        primary: "#13ec5b",
        "background-light": "#f6f8f6",
        "background-dark": "#102216",
        "surface-dark": "#1c2e22",
      },
    },
  },
  plugins: [],
};
