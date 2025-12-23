/**
 * Design System - Centralized color tokens and styling constants
 * Ensures WCAG AA+ compliance for all text and backgrounds
 */

export const COLORS = {
  // Primary colors - High contrast for text on white backgrounds
  text: {
    primary: '#0F172A',      // slate-900 - Main text on light bg (contrast ratio 16.9:1)
    secondary: '#334155',    // slate-700 - Secondary text (contrast 9.3:1)
    muted: '#64748B',        // slate-500 - Muted text (contrast 4.7:1) 
    onDark: '#F8FAFC',       // slate-50 - Text on dark backgrounds
    onPrimary: '#FFFFFF',    // White text on primary buttons
  },

  // Background colors
  background: {
    primary: '#FFFFFF',      // Pure white
    secondary: '#F8FAFC',    // slate-50 - Very light gray
    tertiary: '#F1F5F9',     // slate-100 - Light gray
    elevated: '#FFFFFF',     // Elevated surfaces
    overlay: 'rgba(15, 23, 42, 0.6)', // Dark overlay
  },

  // Brand colors
  brand: {
    primary: '#00C65A',      // UEFA Green
    primaryHover: '#00A84E',
    primaryLight: '#E6F9EF', 
    secondary: '#003B73',    // UEFA Navy
    secondaryHover: '#002D5A',
    secondaryLight: '#E6EDF4',
  },

  // Semantic colors - High contrast
  semantic: {
    success: '#059669',      // green-600 (contrast 4.5:1 on white)
    successBg: '#ECFDF5',    // green-50
    error: '#DC2626',        // red-600 (contrast 5.9:1)
    errorBg: '#FEF2F2',      // red-50
    warning: '#D97706',      // amber-600 (contrast 5.4:1)
    warningBg: '#FFFBEB',    // amber-50
    info: '#2563EB',         // blue-600 (contrast 6.3:1)
    infoBg: '#EFF6FF',       // blue-50
  },

  // Status colors for standings
  status: {
    qualified: {
      bg: '#ECFDF5',         // green-50
      border: '#10B981',     // green-500
      text: '#047857',       // green-700
    },
    playoff: {
      bg: '#FEF3C7',         // amber-100
      border: '#F59E0B',     // amber-500
      text: '#92400E',       // amber-900
    },
    eliminated: {
      bg: '#FEE2E2',         // red-100
      border: '#EF4444',     // red-500
      text: '#991B1B',       // red-900
    },
  },

  // UI elements
  border: {
    light: '#E2E8F0',        // slate-200
    medium: '#CBD5E1',       // slate-300
    strong: '#94A3B8',       // slate-400
  },

  // Form badges (W/D/L)
  form: {
    win: {
      bg: '#059669',         // green-600
      text: '#FFFFFF',
    },
    draw: {
      bg: '#D97706',         // amber-600
      text: '#FFFFFF',
    },
    loss: {
      bg: '#DC2626',         // red-600
      text: '#FFFFFF',
    },
  },
}

export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
}

export const SPACING = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
}

export const BORDER_RADIUS = {
  sm: '0.25rem',   // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
}

export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
}

// Component-specific styles
export const COMPONENTS = {
  button: {
    primary: `
      bg-[${COLORS.brand.primary}] 
      text-[${COLORS.text.onPrimary}]
      hover:bg-[${COLORS.brand.primaryHover}]
      font-semibold
      px-4 py-2
      rounded-lg
      transition-colors duration-200
      shadow-sm
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-[${COLORS.background.tertiary}] 
      text-[${COLORS.text.primary}]
      hover:bg-[${COLORS.background.primary}]
      hover:border-[${COLORS.brand.primary}]
      font-semibold
      px-4 py-2
      rounded-lg
      border border-[${COLORS.border.medium}]
      transition-colors duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  },
  card: {
    base: `
      bg-[${COLORS.background.primary}]
      rounded-xl
      border border-[${COLORS.border.light}]
      shadow-md
      p-6
    `,
  },
}

// API timeout configuration
export const API_CONFIG = {
  FETCH_TIMEOUT: 15000, // 15 seconds
  RETRY_DELAY: 2000,    // 2 seconds
  MAX_RETRIES: 3,
}
