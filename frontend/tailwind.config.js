/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "primary-orange": "rgb(var(--color-primary-orange) / <alpha-value>)",
        "primary-orange-soft": "rgb(var(--color-primary-orange-soft) / <alpha-value>)",
        "secondary-green": "rgb(var(--color-secondary-green) / <alpha-value>)",
        "secondary-blue": "rgb(var(--color-secondary-blue) / <alpha-value>)",
        "accent-red": "rgb(var(--color-accent-red) / <alpha-value>)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        sidebar: "var(--shadow-sidebar)"
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        badge: "var(--radius-badge)"
      },
      fontFamily: {
        sans: ["\"Plus Jakarta Sans\"", "\"Poppins\"", "sans-serif"]
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "float-soft": "float-soft 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
