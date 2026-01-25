/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Persona colors (referenced by ID, names hidden)
        p1: {
          primary: '#0F172A',   // Navy
          accent: '#D4AF37',    // Gold
        },
        p2: {
          primary: '#2E1065',   // Deep Purple
          accent: '#000000',    // Black
        },
        p3: {
          primary: '#064E3B',   // Emerald
          accent: '#64748B',    // Slate
        },
        p4: {
          primary: '#991B1B',   // Crimson
          accent: '#18181B',    // Charcoal
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'cursor-blink': 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
