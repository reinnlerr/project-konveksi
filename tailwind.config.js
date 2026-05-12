/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#0f1117",
          brown: "#8B5E3C",
          dark: "#171a22",
          muted: "#2a2f3c",
          accent: "#f4de68",
          panel: "#1a1f2b",
          panelSoft: "#222838",
          text: "#f5f7ff",
          textMuted: "#9aa3b5"
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "Segoe UI", "Roboto", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(40, 20, 8, 0.07)",
        premium: "0 18px 40px rgba(75, 43, 20, 0.08)"
      }
    }
  },
  plugins: []
};
