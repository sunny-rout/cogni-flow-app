/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f172a",
        surface: "#1e293b",
        card: "#334155",
        "border-col": "#475569",
        "text-col": "#f1f5f9",
        muted: "#94a3b8",
      },
    },
  },
  plugins: [],
}
