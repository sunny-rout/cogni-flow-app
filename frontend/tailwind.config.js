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
        border: "#475569",
        "text-primary": "#f1f5f9",
        muted: "#94a3b8",
        accent: "#3b82f6",
        "accent-hover": "#2563eb",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        "danger-hover": "#dc2626",
      },
    },
  },
  plugins: [],
}
