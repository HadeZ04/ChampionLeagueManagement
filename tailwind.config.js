/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pitch-bg-main': '#FFFFFF',
        'pitch-bg-soft': '#F5F7FB',
        'pitch-border': '#E2E8F0',
        'pitch-divider': '#CBD5E1',
        'pitch-ink': '#111827',
        'pitch-muted': '#6B7280',
        'pitch-on-dark': '#F9FAFB',
        'pitch-green': '#00C65A',
        'pitch-green-dark': '#00924A',
        'pitch-navy': '#003B73',
        'pitch-ocean': '#0074F0',
        'pitch-ocean-soft': '#E3F2FF',
        'pitch-orange': '#FF9F1C',
        'pitch-red': '#FF0044',
        'pitch-gold': '#FACC15',
        'pitch-graphite': '#0A0F1C',
        'pitch-shadow': 'rgba(0, 59, 115, 0.18)',
        'accent-blue': '#0074F0',
        'accent-orange': '#FF9F1C',
        'accent-red': '#FF0044',
        'accent-gold': '#FACC15',
        'accent-green': '#00C65A',
        'accent-glow': 'rgba(0, 198, 90, 0.25)',
        'glass-border': 'rgba(0, 59, 115, 0.18)',
        'glass-highlight': 'rgba(255, 255, 255, 0.65)',
        'net-charcoal': '#0B0F19',
        'stadium-mist': 'rgba(227, 242, 255, 0.9)',
        'stadium-deep': '#01203F',

        // Legacy UEFA tokens remapped to the new palette for backwards compatibility
        'uefa-blue': '#00C65A',
        'uefa-light-blue': '#E3F2FF',
        'uefa-dark': '#003B73',
        'uefa-gray': '#475569', // Changed from #6B7280 for better contrast (WCAG AAA)
        'uefa-gold': '#FACC15',
        'uefa-silver': '#E2E8F0',
        'uefa-bronze': '#FF9F1C',
        'uefa-green': '#00C65A',
        'uefa-red': '#FF0044',
        'uefa-yellow': '#FACC15',
        'uefa-purple': '#0074F0',
        'uefa-cyan': '#00C65A',
        'uefa-white': '#FFFFFF',
        'uefa-black': '#111827',
        'uefa-light-gray': '#F5F7FB',
        'uefa-medium-gray': '#E2E8F0',
        'uefa-dark-gray': '#003B73'
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Manrope"', 'system-ui', 'sans-serif'],
        numbers: ['"Manrope"', 'system-ui', 'sans-serif']
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem'
      },
      borderRadius: {
        'glass-sm': '16px',
        'glass': '24px',
        'glass-lg': '32px',
        'pill': '999px',
        'uefa': '0.375rem',
        'uefa-lg': '0.5rem',
        'uefa-xl': '0.75rem'
      },
      boxShadow: {
        'pitch-soft': '0 25px 70px rgba(0, 59, 115, 0.08)',
        'pitch-strong': '0 35px 95px rgba(0, 59, 115, 0.15)',
        'pitch-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-bright': 'inset 0 1px 0 rgba(255,255,255,0.7), 0 30px 70px rgba(0, 59, 115, 0.18)',
        'ocean-focus': '0 0 0 3px rgba(0, 116, 240, 0.25)',
        'accent-live': '0 18px 40px rgba(255, 159, 28, 0.35)',
        'accent-danger': '0 18px 40px rgba(255, 0, 68, 0.32)',
        'uefa': '0 22px 60px rgba(0, 59, 115, 0.12)',
        'uefa-lg': '0 32px 80px rgba(0, 59, 115, 0.18)',
        'uefa-xl': '0 42px 110px rgba(0, 59, 115, 0.24)'
      },
      backgroundImage: {
        'pitch-ocean':
          'linear-gradient(145deg, rgba(0,59,115,0.92), rgba(0,116,240,0.85))',
        'pitch-glass':
          'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(227,242,255,0.62))',
        'pitch-dual':
          'radial-gradient(circle at 18% 20%, rgba(0,198,90,0.3), transparent 55%), radial-gradient(circle at 78% 0%, rgba(0,116,240,0.28), transparent 60%)',
        'pitch-sheen':
          'linear-gradient(110deg, rgba(255,255,255,0.65), rgba(255,255,255,0) 60%)'
      },
      animation: {
        aurora: 'aurora 32s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glowPulse 12s ease-in-out infinite'
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.95)' },
          '50%': { opacity: '0.9', transform: 'scale(1.1)' }
        },
      },
    },
  },
  plugins: [],
}
