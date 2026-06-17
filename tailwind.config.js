/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        quantum: {
          space: "#0f172a",
          deep: "#0b1220",
          night: "#020617",
          cyan: "#06b6d4",
          violet: "#a855f7",
          fuchsia: "#d946ef",
          amber: "#fb923c",
          emerald: "#10b981",
        },
      },
      backgroundImage: {
        "gradient-quantum": "linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)",
        "gradient-cy-vio": "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)",
        "grid-glow":
          "radial-gradient(circle at 20% 30%, rgba(6,182,212,0.08), transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.08), transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(6,182,212,0.45)",
        "glow-violet": "0 0 28px rgba(168,85,247,0.5)",
        "glow-amber": "0 0 24px rgba(251,146,60,0.5)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(6,182,212,0.25)" },
          "50%": { boxShadow: "0 0 24px rgba(168,85,247,0.45)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float-y": "float-y 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
