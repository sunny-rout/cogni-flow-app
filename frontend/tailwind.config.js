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
        accent: "#8b5cf6",
        teal: "#0ea5e9",
        green: "#10b981",
        amber: "#f59e0b",
        blue: "#3b82f6",
        red: "#ef4444",
        "text-col": "#f1f5f9",
        muted: "#94a3b8",
      },
    },
  },
  plugins: [],
}
