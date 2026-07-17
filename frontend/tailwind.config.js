/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        neutral: {
          850: '#202020',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // ─── ArchStudio Brand Tokens ───────────────────────────────────────
        arch: {
          primary: '#0A2540',   // Royal Blue
          gold: '#D4AF37',   // Accent Gold
          'gold-dark': '#B8941F', // Gold hover state
          dark: '#1A1A1A',   // Light Dark / Charcoal
          bg: '#F7F7F5',   // Supporting Background
          surface: '#FFFFFF',   // Surface / Cards
          muted: '#6B7280',   // Muted Text
          border: 'rgba(10,37,64,0.12)', // Borders
          // Sidebar tones
          'sidebar': '#0A2540',
          'sidebar-deep': '#071c30',
          'sidebar-hover': 'rgba(212,175,55,0.1)',
        },
      },
      boxShadow: {
        'premium': '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)',
        'premium-lg': '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)',
        'arch-card': '0 2px 8px 0 rgba(10,37,64,0.07), 0 0 0 1px rgba(10,37,64,0.05)',
        'arch-lg': '0 12px 28px -4px rgba(10,37,64,0.12), 0 4px 8px -2px rgba(10,37,64,0.06)',
        'gold': '0 4px 12px 0 rgba(212,175,55,0.25)',
      },
      borderColor: {
        'arch': 'rgba(10,37,64,0.12)',
      },
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
