import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "#ffffff",
        },
        "accent-gold": "#C6A66B",
        "soft-blue": "#EAF0F7",
        "warm-ivory": "#F8F7F3",
        navy: "#14264D",
        "navy-deep": "#0E182A",
        // Career Avsar Official Palette
        "brand-navy": "#14264D",
        "brand-royal": "#1266C5",
        "brand-electric": "#087FE8",
        "brand-cyan": "#08C9E8",
        "brand-purple": "#7024BD",
        "brand-magenta": "#B51C9B",
        "brand-orange": "#F28B19",
        "brand-bg": "#F6F8FC",
        highlight: "rgb(var(--color-highlight) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Manrope", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "1.4" }],
        sm: ["var(--text-sm)", { lineHeight: "1.45" }],
        base: ["var(--text-base)", { lineHeight: "1.55" }],
        lg: ["var(--text-lg)", { lineHeight: "1.45" }],
        xl: ["var(--text-xl)", { lineHeight: "1.35" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "1.25" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "1.15" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glass-sm": "var(--shadow-glass-sm)",
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      screens: {
        xs: "375px",
        sm: "430px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1920px",
      },
      minHeight: {
        touch: "var(--touch-target)",
      },
      minWidth: {
        touch: "var(--touch-target)",
      },
    },
  },
  plugins: [],
};
export default config;
