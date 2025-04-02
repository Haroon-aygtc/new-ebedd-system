/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Montserrat", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Luxury color palette
        luxury: {
          50: "#f9f7f7",
          100: "#f1eeee",
          200: "#e5e0e0",
          300: "#d1c8c8",
          400: "#b5a7a7",
          500: "#9c8989",
          600: "#8a7575",
          700: "#746060",
          800: "#625252",
          900: "#544747",
          950: "#302828",
        },
        gold: {
          50: "#fbf8eb",
          100: "#f7f0c7",
          200: "#f0e290",
          300: "#e9cf58",
          400: "#e2bc32",
          500: "#d4a41e",
          600: "#bc8317",
          700: "#9c6216",
          800: "#824e19",
          900: "#6f4119",
          950: "#412209",
        },
        navy: {
          50: "#f0f5fc",
          100: "#dce8f7",
          200: "#c1d7f2",
          300: "#96bde9",
          400: "#659add",
          500: "#4179d0",
          600: "#2c5fc3",
          700: "#264eb3",
          800: "#254192",
          900: "#233976",
          950: "#192348",
        },
        emerald: {
          50: "#eefdf7",
          100: "#d6fbeb",
          200: "#b0f5d8",
          300: "#79eabe",
          400: "#40d69e",
          500: "#1db981",
          600: "#139769",
          700: "#127856",
          800: "#135e46",
          900: "#124d3b",
          950: "#072b21",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-out-left": "slide-out-left 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      boxShadow: {
        luxury: "0 10px 50px -12px rgba(0, 0, 0, 0.15)",
        "luxury-lg": "0 20px 60px -15px rgba(0, 0, 0, 0.2)",
        "luxury-inner": "inset 0 2px 10px 0 rgba(0, 0, 0, 0.06)",
        gold: "0 4px 20px -2px rgba(212, 164, 30, 0.3)",
      },
      backgroundImage: {
        "gradient-luxury": "linear-gradient(to right, #f9f7f7, #f1eeee)",
        "gradient-gold": "linear-gradient(to right, #e9cf58, #d4a41e)",
        "gradient-navy": "linear-gradient(to right, #4179d0, #254192)",
        "gradient-emerald": "linear-gradient(to right, #1db981, #135e46)",
        shimmer:
          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
