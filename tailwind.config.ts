import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0a0b0f", 2: "#111318", 3: "#171a21", 4: "#1f232c" },
        line: { DEFAULT: "#272b35", 2: "#343946" },
        fg: { DEFAULT: "#f3f4f6", 2: "#b8bcc8", 3: "#7c8190" },
        val: { DEFAULT: "#ff4655", glow: "#ff8a95", dim: "#c42f3c" },
        teal: { DEFAULT: "#3df5c8", dim: "#1fb995" },
        gold: "#f0c75e",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,70,85,.35), 0 10px 40px -10px rgba(255,70,85,.45)",
        card: "0 1px 0 rgba(255,255,255,.04) inset, 0 12px 30px -16px rgba(0,0,0,.8)",
      },
      keyframes: {
        rise: { from: { opacity: "0" }, to: { opacity: "1" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".3" } },
      },
      animation: { rise: "rise .4s ease-out", pulseDot: "pulseDot 1.6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
