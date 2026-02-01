/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A56DB", // Deep Blue
        secondary: "#7E3AF2", // Purple
        dark: {
          900: "#111827",
          800: "#1F2937",
          700: "#374151",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
