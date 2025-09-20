/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uefa-blue': '#003399',
        'uefa-light-blue': '#0066cc',
        'uefa-dark': '#001a4d',
        'uefa-gray': '#6c757d',
        'uefa-gold': '#ffd700',
        'uefa-silver': '#c0c0c0',
        'uefa-bronze': '#cd7f32',
        'uefa-green': '#28a745',
        'uefa-red': '#dc3545',
        'uefa-yellow': '#ffc107',
        'uefa-purple': '#6f42c1',
        'uefa-cyan': '#17a2b8',
        'uefa-white': '#ffffff',
        'uefa-black': '#000000',
        'uefa-light-gray': '#f8f9fa',
        'uefa-medium-gray': '#e9ecef',
        'uefa-dark-gray': '#495057',
      },
      fontFamily: {
        'uefa': ['Arial', 'Helvetica', 'sans-serif'],
        'uefa-bold': ['Arial Black', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'uefa-xs': '0.75rem',
        'uefa-sm': '0.875rem',
        'uefa-base': '1rem',
        'uefa-lg': '1.125rem',
        'uefa-xl': '1.25rem',
        'uefa-2xl': '1.5rem',
        'uefa-3xl': '1.875rem',
        'uefa-4xl': '2.25rem',
        'uefa-5xl': '3rem',
      },
      spacing: {
        'uefa-xs': '0.25rem',
        'uefa-sm': '0.5rem',
        'uefa-md': '1rem',
        'uefa-lg': '1.5rem',
        'uefa-xl': '2rem',
        'uefa-2xl': '3rem',
      },
      borderRadius: {
        'uefa': '0.375rem',
        'uefa-lg': '0.5rem',
        'uefa-xl': '0.75rem',
      },
      boxShadow: {
        'uefa': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'uefa-lg': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'uefa-xl': '0 8px 16px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
